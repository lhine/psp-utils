import axios from "axios"
import * as cheerio from "cheerio"

export async function getHeadingContent(url: string, heading: string) {
  try {
    const res = await axios.get(url)

    if (res.status !== 200) return

    const html = res.data
    const $ = cheerio.load(html)

    const divsWithASD = $(`div > div > h2:contains(${heading})`)
      .parent()
      .parent()

    const links: string[] = []
    divsWithASD.each((index, element) => {
      $(element)
        .find("a")
        .each((_, anchor) => {
          const href = $(anchor).attr("href") || ""

          const linkExterno = !href.includes("www.prefeitura.sp.gov.br")

          const originalPath = url.split("secretarias/")[1]
          let urlPath = originalPath || ""

          if (originalPath?.includes("index.php")) {
            urlPath = originalPath.split("index.php")[0]
          }

          let id = ""
          if (href.includes("p=")) id = href.split("p=")[1]

          if (href) {
            links.push(
              `${id}; ${heading
                .toLowerCase()
                .replace(" ", "-")}; ${urlPath}; ${linkExterno}; ${
                linkExterno ? href : ""
              };`
            )
          }
        })
    })

    if (heading === "NOTÍCIAS") {
      links.splice(-1)
    }

    return links
  } catch (error) {
    console.log("Error @ getHeadingContent", error)
  }
}
