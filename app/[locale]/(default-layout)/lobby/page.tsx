import { useTranslations } from "next-intl";

export default function LobbyPage(props: never) {
  const t = useTranslations();
  return (
    <div className="page-inner-contents page-lobby">
      <header>
        <div className="title">
          <h1 className="lobby-title">{t("title-안녕하세요")}</h1>
        </div>
      </header>
    </div>
  );
}
