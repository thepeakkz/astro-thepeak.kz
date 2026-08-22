import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { createSeoMetadata, getBreadcrumbJsonLd, pageSeo } from "@/lib/seo";
import { formatTypography } from "@/utils/typography";
import NativePageGate from "@/components/cms/NativePageGate";

export const metadata: Metadata = createSeoMetadata(pageSeo.privacy);

export default function PrivacyPage() {
  return (
    <NativePageGate routePath="/privacy">
      <PrivacyContent />
    </NativePageGate>
  );
}

export function PrivacyContent() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Политика конфиденциальности", path: "/privacy" },
        ])}
      />

      {/* Content */}
      <main className="px-[var(--page-margin)] py-[clamp(3rem,6vw,6rem)]">
        <div className="max-w-[720px]">
          {/* Title */}
          <div className="mb-[clamp(2rem,4vw,4rem)] space-y-4 pb-[clamp(2rem,4vw,4rem)] border-b border-brand-gray/10">
            <p className="font-sans text-xs font-extrabold uppercase tracking-widest text-brand-red">
              Документ
            </p>
            <h1 className="font-headline font-semibold text-brand-gray tracking-tight leading-[0.95] text-[clamp(2rem,4vw,3.5rem)]">
              {formatTypography("Политика конфиденциальности")}
            </h1>
            <p className="font-sans text-sm text-brand-gray/60 leading-relaxed max-w-xl">
              {formatTypography(
                "Настоящая Политика конфиденциальности (далее – Политика) устанавливает правила использования персональной информации, получаемой от пользователей сайта (далее – Пользователи) администратором сайта (https://thepeak.kz) (далее – Компания)."
              )}
            </p>
          </div>

          {/* Intro */}
          <div className="mb-[clamp(2rem,4vw,4rem)] space-y-3">
            <p className="font-sans text-sm text-brand-gray/80 leading-relaxed">
              {formatTypography(
                "Настоящая Политика конфиденциальности применяется ко всем Пользователям Сайта."
              )}
            </p>
            <p className="font-sans text-sm text-brand-gray/80 leading-relaxed">
              {formatTypography(
                "Все термины и определения, встречающиеся в тексте Политики толкуются в соответствии с действующим законодательством РК."
              )}
            </p>
            <p className="font-sans text-sm text-brand-gray/80 leading-relaxed">
              {formatTypography(
                "Пользователи прямо соглашаются на обработку своих персональных данных, как это описано в настоящей Политике."
              )}
            </p>
            <p className="font-sans text-sm text-brand-gray/80 leading-relaxed">
              {formatTypography(
                "Использование сайта означает выражение Пользователем безоговорочного согласия с Политикой и указанными условиями обработки информации."
              )}
            </p>
            <p className="font-sans text-sm text-brand-gray/80 leading-relaxed">
              {formatTypography(
                "Пользователь не должен пользоваться сайтом, если Пользователь не согласен с условиями Политики."
              )}
            </p>
          </div>

          {/* TOC */}
          <div className="mb-[clamp(2rem,4vw,4rem)] border border-brand-gray/10 p-6 bg-brand-light-gray/30">
            <p className="font-sans text-xs font-extrabold uppercase tracking-widest text-brand-gray/50 mb-4">
              Содержание
            </p>
            <ol className="space-y-2">
              {[
                "Персональная информация Пользователей",
                "Цели обработки персональной информации Пользователей",
                "Условия и способы обработки персональной информации Пользователей",
                "Меры, применяемые для защиты персональной информации Пользователя",
                "Разрешение споров",
                "Дополнительные условия",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-sans text-xs font-bold text-brand-red flex-shrink-0 mt-0.5">
                    {i + 1}.
                  </span>
                  <span className="font-sans text-sm text-brand-gray/70">
                    {formatTypography(item)}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Sections */}
          <div className="space-y-[clamp(2rem,4vw,4rem)]">
            {/* 1 */}
            <section>
              <h2 className="font-headline font-semibold text-brand-gray text-[clamp(1.1rem,1.5vw,1.4rem)] mb-5 pb-4 border-b border-brand-gray/10">
                {formatTypography("1. Персональная информация Пользователей")}
              </h2>
              <div className="space-y-4">
                <PrivacyItem num="1.1">
                  {formatTypography(
                    "Сайт собирает, получает доступ и использует в определенных Политикой целях персональные данные Пользователей, техническую и иную информацию, связанную с Пользователями."
                  )}
                </PrivacyItem>
                <PrivacyItem num="1.2">
                  {formatTypography(
                    "Техническая информация не является персональными данными. Компания использует файлы cookies, которые позволяют идентифицировать Пользователя."
                  )}
                  <p className="mt-2 font-sans text-sm text-brand-gray/70 leading-relaxed pl-0">
                    {formatTypography(
                      "Файлы cookies – это текстовые файлы, доступные Компании, для обработки информации об активности Пользователя, включая информацию о том, какие страницы посещал Пользователь и о времени, которое Пользователь провел на странице."
                    )}
                  </p>
                  <p className="mt-2 font-sans text-sm text-brand-gray/70 leading-relaxed">
                    {formatTypography(
                      "Пользователь может отключить возможность использования файлов cookies в настройках браузера."
                    )}
                  </p>
                </PrivacyItem>
                <PrivacyItem num="1.3">
                  {formatTypography(
                    "Также под технической информацией понимается информация, которая автоматически передается Компании в процессе использования Сайта с помощью установленного на устройстве Пользователя программного обеспечения."
                  )}
                </PrivacyItem>
                <PrivacyItem num="1.4">
                  {formatTypography(
                    "Под персональными данными Пользователя понимается информация, которую Пользователь предоставляет Компании при заполнении заявки на Сайте и последующем использовании Сайта."
                  )}
                  <p className="mt-2 font-sans text-sm text-brand-gray/70 leading-relaxed">
                    {formatTypography(
                      "Обязательная для предоставления Компании информация помечена специальным образом."
                    )}
                  </p>
                  <p className="mt-2 font-sans text-sm text-brand-gray/70 leading-relaxed">
                    {formatTypography(
                      "Иная информация предоставляется Пользователем на его усмотрение."
                    )}
                  </p>
                </PrivacyItem>
                <PrivacyItem num="1.5">
                  {formatTypography(
                    "Компания также может обрабатывать данные, сделанные общедоступными субъектом персональных данных или подлежащие опубликованию или обязательному раскрытию в соответствии с законом."
                  )}
                </PrivacyItem>
                <PrivacyItem num="1.6">
                  {formatTypography(
                    "Компания не проверяет достоверность персональной информации, предоставляемой Пользователем, и не имеет возможности оценивать его дееспособность."
                  )}
                  <p className="mt-2 font-sans text-sm text-brand-gray/70 leading-relaxed">
                    {formatTypography(
                      "Однако Компания исходит из того, что Пользователь предоставляет достоверную и достаточную персональную информацию о себе и поддерживает эту информацию в актуальном состоянии."
                    )}
                  </p>
                </PrivacyItem>
              </div>
            </section>

            {/* 2 */}
            <section>
              <h2 className="font-headline font-semibold text-brand-gray text-[clamp(1.1rem,1.5vw,1.4rem)] mb-5 pb-4 border-b border-brand-gray/10">
                {formatTypography(
                  "2. Цели обработки персональной информации Пользователей"
                )}
              </h2>
              <div className="space-y-4">
                <PrivacyItem num="2.1">
                  {formatTypography(
                    "Главная цель Компании при сборе персональных данных — предоставление информационных, консультационных услуг Пользователям."
                  )}
                  <p className="mt-2 font-sans text-sm text-brand-gray/70 leading-relaxed">
                    {formatTypography(
                      "Пользователи соглашаются с тем, что Компания также может использовать их персональные данные для:"
                    )}
                  </p>
                  <ul className="mt-3 space-y-2 pl-1">
                    {[
                      "Идентификация стороны в рамках предоставляемых услуг;",
                      "Предоставления услуг и клиентской поддержки по запросу Пользователей;",
                      "Улучшение качества услуг, удобства их использования, разработка и развитие Сайта, устранения технических неполадок или проблем с безопасностью;",
                      "Анализ для расширения и совершенствования услуг, информационного наполнения и рекламы услуг;",
                      "Информирования Пользователей об услугах, целевом маркетинге, обновлении услуг и рекламных предложениях на основании информационных предпочтений Пользователей;",
                      "Таргетирование рекламных материалов; рассылки индивидуальных маркетинговых сообщений посредством электронной почты;",
                      "Проведение статистических и иных исследований на основе обезличенных данных.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-brand-red flex-shrink-0 mt-2" />
                        <span className="font-sans text-sm text-brand-gray/70 leading-relaxed">
                          {formatTypography(item)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </PrivacyItem>
                <PrivacyItem num="2.2">
                  {formatTypography(
                    "Компания использует техническую информацию обезличено в целях, указанных в пункте 2.1."
                  )}
                </PrivacyItem>
              </div>
            </section>

            {/* 3 */}
            <section>
              <h2 className="font-headline font-semibold text-brand-gray text-[clamp(1.1rem,1.5vw,1.4rem)] mb-5 pb-4 border-b border-brand-gray/10">
                {formatTypography(
                  "3. Условия и способы обработки персональной информации Пользователей"
                )}
              </h2>
              <div className="space-y-4">
                <PrivacyItem num="3.1">
                  {formatTypography(
                    "Пользователь дает согласие на обработку своих персональных данных путём отправки заявки (любой письменный запрос, содержащий контактные данные)."
                  )}
                </PrivacyItem>
                <PrivacyItem num="3.2">
                  {formatTypography(
                    "Обработка персональных данных Пользователя означает сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных Пользователя."
                  )}
                </PrivacyItem>
                <PrivacyItem num="3.3">
                  {formatTypography(
                    "В отношении персональной информации Пользователя сохраняется ее конфиденциальность, кроме случаев добровольного предоставления Пользователем информации о себе для общего доступа неограниченному кругу лиц."
                  )}
                </PrivacyItem>
                <PrivacyItem num="3.4">
                  {formatTypography(
                    "Компания вправе передать персональную информацию Пользователя третьим лицам в следующих случаях:"
                  )}
                  <ul className="mt-3 space-y-2 pl-1">
                    {[
                      "Пользователь выразил согласие на такие действия;",
                      "Передача необходима для использования Пользователем определенной услуги Сайта либо для исполнения определенного договора или соглашения с Пользователем;",
                      "Передача уполномоченным органам государственной власти Республики Казахстан по основаниям и в порядке, установленным законодательством Республики Казахстан;",
                      "В целях обеспечения возможности защиты прав и законных интересов Компании или третьих лиц в случаях, когда Пользователь нарушает условия договоров и соглашений с Компанией, настоящую Политику, либо документы, содержащие условия использования конкретных услуг;",
                      "В результате обработки персональной информации Пользователя путем ее обезличивания получены обезличенные статистические данные, передаются третьему лицу для проведения исследований, выполнения работ или оказания услуг по поручению Компании.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-brand-red flex-shrink-0 mt-2" />
                        <span className="font-sans text-sm text-brand-gray/70 leading-relaxed">
                          {formatTypography(item)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </PrivacyItem>
              </div>
            </section>

            {/* 4 */}
            <section>
              <h2 className="font-headline font-semibold text-brand-gray text-[clamp(1.1rem,1.5vw,1.4rem)] mb-5 pb-4 border-b border-brand-gray/10">
                {formatTypography(
                  "4. Меры, применяемые для защиты персональной информации Пользователя"
                )}
              </h2>
              <div className="space-y-4">
                <PrivacyItem num="4.1">
                  {formatTypography(
                    "Компания принимает необходимые и достаточные правовые, организационные и технические меры для защиты персональной информации Пользователя от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий с ней третьих лиц."
                  )}
                </PrivacyItem>
              </div>
            </section>

            {/* 5 */}
            <section>
              <h2 className="font-headline font-semibold text-brand-gray text-[clamp(1.1rem,1.5vw,1.4rem)] mb-5 pb-4 border-b border-brand-gray/10">
                {formatTypography("5. Разрешение споров")}
              </h2>
              <div className="space-y-4">
                <PrivacyItem num="5.1">
                  {formatTypography(
                    "Все возможные споры, вытекающие из отношений, регулируемых настоящей Политикой, разрешаются в порядке, установленном действующим законодательством Республики Казахстан, по нормам казахстанского права."
                  )}
                </PrivacyItem>
                <PrivacyItem num="5.2">
                  {formatTypography(
                    "Соблюдение досудебного (претензионного) порядка урегулирования споров является обязательным."
                  )}
                </PrivacyItem>
              </div>
            </section>

            {/* 6 */}
            <section>
              <h2 className="font-headline font-semibold text-brand-gray text-[clamp(1.1rem,1.5vw,1.4rem)] mb-5 pb-4 border-b border-brand-gray/10">
                {formatTypography("6. Дополнительные условия")}
              </h2>
              <div className="space-y-4">
                <PrivacyItem num="6.1">
                  {formatTypography(
                    "Компания вправе вносить изменения в настоящую Политику конфиденциальности без согласия Пользователя."
                  )}
                </PrivacyItem>
                <PrivacyItem num="6.2">
                  {formatTypography(
                    "Новая Политика конфиденциальности вступает в силу с момента ее размещения, если иное не предусмотрено новой редакцией Политики конфиденциальности."
                  )}
                </PrivacyItem>
              </div>
            </section>
          </div>

          {/* Footer note */}
          <div className="mt-[clamp(3rem,5vw,5rem)] pt-8 border-t border-brand-gray/10">
            <p className="font-sans text-xs text-brand-gray/40">
              © {new Date().getFullYear()} ThePeak. Все права защищены.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function PrivacyItem({
  num,
  children,
}: {
  num: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="font-sans text-xs font-bold text-brand-red flex-shrink-0 mt-0.5 w-6">
        {num}
      </span>
      <div className="font-sans text-sm text-brand-gray/80 leading-relaxed flex-1">
        {children}
      </div>
    </div>
  );
}
