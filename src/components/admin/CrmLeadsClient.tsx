"use client";

import { useEffect, useRef, useState } from "react";
import { Inbox, Search, Trash2 } from "lucide-react";
import { deleteLeadAction, updateLeadStatusAction } from "@/app/admin/actions";
import { whatsappUrl } from "@/lib/utils";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type Lead,
  type LeadListResult,
  type LeadStatus,
} from "@/types/leads";
import { formatTypography } from "@/utils/typography";

type StatusFilter = "all" | LeadStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: "contacted", label: "Связались" },
  { value: "closed", label: "Закрыты" },
  { value: "junk", label: "Спам" },
];

function formatLeadDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Qostanay",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || "";

  return `${part("day")}.${part("month")}.${part("year")} ${part("hour")}:${part("minute")}`;
}

function leadChannel(lead: Lead) {
  return lead.attribution?.firstTouch?.source?.trim() || "";
}

const statusBadgeStyles: Record<LeadStatus, string> = {
  new: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-purple-50 text-purple-700 border-purple-200",
  closed: "bg-slate-100 text-slate-700 border-slate-300",
  junk: "bg-red-50 text-red-700 border-red-200",
};

export default function CrmLeadsClient({ initialData }: { initialData: LeadListResult }) {
  const [leads, setLeads] = useState(initialData.leads);
  const [total, setTotal] = useState(initialData.total);
  const [newCount, setNewCount] = useState(initialData.newCount);
  const [filteredTotal, setFilteredTotal] = useState(initialData.filteredTotal);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [page, setPage] = useState(initialData.page);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const firstFilterRun = useRef(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (firstFilterRun.current) {
      firstFilterRun.current = false;
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({ page: "1" });
    if (status !== "all") params.set("status", status);
    if (debouncedSearch) params.set("q", debouncedSearch);

    async function loadFilteredLeads() {
      setLoading(true);
      setMessage(null);
      try {
        const response = await fetch(`/api/admin/leads?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = (await response.json()) as LeadListResult & { error?: string };
        if (!response.ok) throw new Error(data.error || "Не удалось загрузить заявки.");

        setLeads(data.leads);
        setTotal(data.total);
        setNewCount(data.newCount);
        setFilteredTotal(data.filteredTotal);
        setHasMore(data.hasMore);
        setPage(1);
        setExpandedIds(new Set());
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Не удалось загрузить заявки.",
        });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadFilteredLeads();
    return () => controller.abort();
  }, [debouncedSearch, status]);

  function markBusy(id: string, busy: boolean) {
    setBusyIds((current) => {
      const next = new Set(current);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleStatusChange(lead: Lead, nextStatus: LeadStatus) {
    if (nextStatus === lead.status || busyIds.has(lead.id)) return;

    const previousStatus = lead.status;
    setMessage(null);
    markBusy(lead.id, true);
    setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status: nextStatus } : item)));
    if (previousStatus === "new") setNewCount((current) => Math.max(0, current - 1));
    if (nextStatus === "new") setNewCount((current) => current + 1);

    const result = await updateLeadStatusAction(lead.id, nextStatus);
    if (result.error) {
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status: previousStatus } : item)));
      if (previousStatus === "new") setNewCount((current) => current + 1);
      if (nextStatus === "new") setNewCount((current) => Math.max(0, current - 1));
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: result.success || "Статус заявки обновлён." });
      if (status !== "all" && status !== nextStatus) {
        setLeads((current) => current.filter((item) => item.id !== lead.id));
        setFilteredTotal((current) => Math.max(0, current - 1));
      }
    }
    markBusy(lead.id, false);
  }

  async function handleDelete(lead: Lead) {
    if (busyIds.has(lead.id)) return;
    if (!window.confirm(`Удалить заявку от «${lead.name}»? Это действие нельзя отменить.`)) return;

    const originalIndex = leads.findIndex((item) => item.id === lead.id);
    setMessage(null);
    markBusy(lead.id, true);
    setLeads((current) => current.filter((item) => item.id !== lead.id));
    setTotal((current) => Math.max(0, current - 1));
    setFilteredTotal((current) => Math.max(0, current - 1));
    if (lead.status === "new") setNewCount((current) => Math.max(0, current - 1));

    const result = await deleteLeadAction(lead.id);
    if (result.error) {
      setLeads((current) => {
        const next = [...current];
        next.splice(Math.max(0, originalIndex), 0, lead);
        return next;
      });
      setTotal((current) => current + 1);
      setFilteredTotal((current) => current + 1);
      if (lead.status === "new") setNewCount((current) => current + 1);
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: result.success || "Заявка удалена." });
    }
    markBusy(lead.id, false);
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    const params = new URLSearchParams({ page: String(nextPage) });
    if (status !== "all") params.set("status", status);
    if (debouncedSearch) params.set("q", debouncedSearch);

    setLoadingMore(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/leads?${params}`, { cache: "no-store" });
      const data = (await response.json()) as LeadListResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось загрузить заявки.");

      setLeads((current) => [...current, ...data.leads]);
      setTotal(data.total);
      setNewCount(data.newCount);
      setFilteredTotal(data.filteredTotal);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Не удалось загрузить заявки.",
      });
    } finally {
      setLoadingMore(false);
    }
  }

  function toggleComment(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isFiltered = status !== "all" || Boolean(debouncedSearch);

  return (
    <main className="peak-admin__main">
      {/* Заголовок страницы */}
      <div className="peak-admin__page-header">
        <div>
          <div className="peak-admin__breadcrumb">
            <span>CMS</span>
            <span>/</span>
            <span>CRM</span>
          </div>
          <h1 className="peak-admin__page-title">Входящие заявки</h1>
          <p className="peak-admin__page-meta">
            {formatTypography(`${newCount} новых лидов · Всего: ${total}`)}
          </p>
        </div>
      </div>

      {/* Тулбар поиска и фильтрации */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="peak-admin__search w-full sm:max-w-xs">
          <Search className="peak-admin__search-icon size-3.5" aria-hidden="true" />
          <input
            id="crm-search"
            className="peak-admin__input !h-9 !text-xs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по имени или телефону…"
            autoComplete="off"
          />
        </div>

        {/* Табы фильтра статусов */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                status === filter.value
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Уведомление */}
      {message && (
        <div
          className={`peak-admin__notice ${
            message.type === "error" ? "peak-admin__notice--error" : "peak-admin__notice--success"
          }`}
          role="status"
        >
          <span>{formatTypography(message.text)}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="ml-auto text-current opacity-70 hover:opacity-100"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
      )}

      {/* Содержимое (Таблица / Пустое состояние) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Загрузка заявок…
        </div>
      ) : leads.length === 0 ? (
        <div className="peak-admin__empty">
          <span className="peak-admin__empty-icon">
            <Inbox className="size-5" aria-hidden="true" />
          </span>
          <p className="peak-admin__empty-title">
            {isFiltered ? "Ничего не найдено" : "Заявок пока нет"}
          </p>
          <p className="peak-admin__empty-copy">
            {isFiltered
              ? "Попробуйте изменить статус или поисковый запрос."
              : "Новые входящие заявки с сайта появятся здесь."}
          </p>
        </div>
      ) : (
        <div className="peak-admin__table-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Дата</th>
                  <th className="py-3.5 px-5">Клиент</th>
                  <th className="py-3.5 px-5">Телефон</th>
                  <th className="py-3.5 px-5">Источник</th>
                  <th className="py-3.5 px-5">Комментарий</th>
                  <th className="py-3.5 px-5">Статус</th>
                  <th className="py-3.5 px-5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leads.map((lead) => {
                  const whatsapp = whatsappUrl(lead.phone);
                  const channel = leadChannel(lead);
                  const expanded = expandedIds.has(lead.id);
                  const busy = busyIds.has(lead.id);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      {/* Дата */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {formatLeadDate(lead.created_at)}
                      </td>

                      {/* Имя */}
                      <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                        {formatTypography(lead.name)}
                      </td>

                      {/* Телефон (клик открывает WhatsApp или звонок) */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <a
                          href={whatsapp || `tel:${lead.phone}`}
                          target={whatsapp ? "_blank" : undefined}
                          rel={whatsapp ? "noopener noreferrer" : undefined}
                          className="font-mono text-slate-700 hover:text-orange-600 transition-colors underline decoration-slate-300 hover:decoration-orange-500 underline-offset-2"
                          title={whatsapp ? "Открыть диалог в WhatsApp" : "Позвонить"}
                        >
                          {lead.phone}
                        </a>
                      </td>

                      {/* Источник */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-slate-800">{formatTypography(lead.source)}</span>
                          {channel && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {channel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Комментарий */}
                      <td className="py-3.5 px-5 max-w-xs">
                        {lead.comment ? (
                          <div
                            onClick={() => toggleComment(lead.id)}
                            className={`cursor-pointer text-slate-600 hover:text-slate-900 transition-colors ${
                              expanded ? "" : "truncate"
                            }`}
                            title={lead.comment}
                          >
                            {formatTypography(lead.comment)}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Статус */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <select
                          className={`text-xs font-medium px-2.5 py-1 rounded-md border outline-none bg-white transition-colors cursor-pointer ${
                            statusBadgeStyles[lead.status]
                          }`}
                          value={lead.status}
                          disabled={busy}
                          onChange={(e) =>
                            void handleStatusChange(lead, e.target.value as LeadStatus)
                          }
                        >
                          {LEAD_STATUSES.map((val) => (
                            <option key={val} value={val} className="bg-white text-slate-800">
                              {LEAD_STATUS_LABELS[val]}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Действия */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleDelete(lead)}
                          className="peak-admin__icon-button peak-admin__icon-button--danger"
                          title="Удалить заявку"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Футер пагинации */}
          <div className="flex items-center justify-between p-3.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            <span>
              Показано {leads.length} из {filteredTotal} заявок
            </span>
            {hasMore && (
              <button
                type="button"
                className="peak-admin__button peak-admin__button--outline !h-8 !text-xs"
                disabled={loadingMore}
                onClick={() => void handleLoadMore()}
              >
                {loadingMore ? "Загружаем…" : "Показать ещё"}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
