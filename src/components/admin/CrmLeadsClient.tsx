"use client";

import { useEffect, useRef, useState } from "react";
import { Inbox, MessageCircle, Search, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
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
    if (!window.confirm(`Удалить заявку от\u00a0«${lead.name}»? Это действие нельзя отменить.`)) return;

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
      <div className="peak-admin__page-header">
        <div>
          <h1 className="peak-admin__page-title">Заявки</h1>
          <p className="peak-admin__page-meta">{newCount} новых из&nbsp;{total} всего</p>
        </div>
      </div>

      <div className="peak-admin__crm-toolbar" aria-label="Фильтры заявок">
        <div className="peak-admin__search">
          <Search className="peak-admin__search-icon size-4" aria-hidden="true" />
          <label className="sr-only" htmlFor="crm-search">Поиск по&nbsp;имени или&nbsp;телефону</label>
          <input
            id="crm-search"
            className="peak-admin__input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по\u00a0имени или\u00a0телефону"
            autoComplete="off"
          />
        </div>
        <div className="peak-admin__period-switcher peak-admin__crm-status-filter" role="group" aria-label="Статус заявки">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`peak-admin__period-btn ${status === filter.value ? "peak-admin__period-btn--active" : ""}`}
              aria-pressed={status === filter.value}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={`peak-admin__notice ${message.type === "error" ? "peak-admin__notice--error" : "peak-admin__notice--success"}`}
          role="status"
        >
          {formatTypography(message.text)}
        </div>
      )}

      {loading ? (
        <div className="peak-admin__crm-loading" role="status">Загружаем заявки…</div>
      ) : leads.length === 0 ? (
        <div className="peak-admin__empty">
          <div>
            <span className="peak-admin__empty-icon">
              <Inbox className="size-5" aria-hidden="true" />
            </span>
            <p className="peak-admin__empty-title">
              {isFiltered ? "По\u00a0этому фильтру ничего не\u00a0найдено" : "Заявок пока нет"}
            </p>
            <p className="peak-admin__empty-copy">
              {isFiltered ? "Попробуйте изменить фильтр или\u00a0поисковый запрос." : "Новые заявки с\u00a0сайта появятся здесь."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="peak-admin__case-table peak-admin__crm-table" role="table" aria-label="Заявки">
            <div className="peak-admin__case-table-head" role="row">
              <span role="columnheader">Дата</span>
              <span role="columnheader">Имя</span>
              <span role="columnheader">Телефон</span>
              <span role="columnheader">Источник</span>
              <span role="columnheader">Комментарий</span>
              <span role="columnheader">Статус</span>
              <span role="columnheader" className="peak-admin__crm-actions-title">Действия</span>
            </div>
            {leads.map((lead) => {
              const whatsapp = whatsappUrl(lead.phone);
              const channel = leadChannel(lead);
              const expanded = expandedIds.has(lead.id);
              const busy = busyIds.has(lead.id);

              return (
                <article className="peak-admin__case-table-row" role="row" key={lead.id}>
                  <time className="peak-admin__crm-date" dateTime={lead.created_at} role="cell" data-label="Дата">
                    {formatLeadDate(lead.created_at)}
                  </time>
                  <strong className="peak-admin__crm-name" role="cell" data-label="Имя" title={lead.name}>
                    {formatTypography(lead.name)}
                  </strong>
                  <div className="peak-admin__crm-phone" role="cell" data-label="Телефон">
                    <a href={`tel:${lead.phone}`} title={`Позвонить: ${lead.phone}`}>{lead.phone}</a>
                    {lead.contact_method.toLocaleLowerCase("ru") === "whatsapp" && whatsapp ? (
                      <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`Написать ${lead.name} в\u00a0WhatsApp`}>
                        <FaWhatsapp aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                  <div className="peak-admin__crm-source" role="cell" data-label="Источник">
                    <span title={lead.source}>{formatTypography(lead.source)}</span>
                    {channel ? <small title={channel}>{channel}</small> : null}
                  </div>
                  <div className="peak-admin__crm-comment-cell" role="cell" data-label="Комментарий">
                    <button
                      type="button"
                      className={`peak-admin__crm-comment ${expanded ? "peak-admin__crm-comment--expanded" : ""}`}
                      title={lead.comment}
                      aria-expanded={expanded}
                      onClick={() => toggleComment(lead.id)}
                    >
                      <MessageCircle className="size-3.5" aria-hidden="true" />
                      <span>{formatTypography(lead.comment)}</span>
                    </button>
                  </div>
                  <div className="peak-admin__crm-status" role="cell" data-label="Статус">
                    <select
                      className={`peak-admin__select peak-admin__crm-select peak-admin__crm-select--${lead.status}`}
                      value={lead.status}
                      disabled={busy}
                      aria-label={`Статус заявки от\u00a0${lead.name}`}
                      onChange={(event) => void handleStatusChange(lead, event.target.value as LeadStatus)}
                    >
                      {LEAD_STATUSES.map((value) => <option value={value} key={value}>{LEAD_STATUS_LABELS[value]}</option>)}
                    </select>
                  </div>
                  <div className="peak-admin__case-table-actions" role="cell" data-label="Действия">
                    <button
                      type="button"
                      className="peak-admin__icon-button peak-admin__icon-button--danger"
                      disabled={busy}
                      onClick={() => void handleDelete(lead)}
                      aria-label={`Удалить заявку от ${lead.name}`}
                      title="Удалить заявку"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="peak-admin__crm-footer">
            <p className="peak-admin__page-meta">Показано {leads.length} из&nbsp;{filteredTotal}</p>
            {hasMore ? (
              <button
                type="button"
                className="peak-admin__btn peak-admin__btn--secondary"
                disabled={loadingMore}
                onClick={() => void handleLoadMore()}
              >
                {loadingMore ? "Загружаем…" : "Показать ещё"}
              </button>
            ) : null}
          </div>
        </>
      )}
    </main>
  );
}
