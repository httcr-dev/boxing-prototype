import boxenV2Html from "./boxen_v2.html?raw";

export function assembleBoxenHtml(): string {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");

  return boxenV2Html.replaceAll('src="assets/', `src="${baseUrl}/assets/`);
}

export default assembleBoxenHtml;
