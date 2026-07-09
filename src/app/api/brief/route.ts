import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { formatTypography } from "@/utils/typography";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Initialize Cloudinary
const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function transliterate(text: string): string {
  const ru: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'ZH',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'TS',
    'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'YU',
    'Я': 'YA'
  };
  return text.split('').map(char => ru[char] !== undefined ? ru[char] : char).join('');
}

function generateSlug(name: string): string {
  return transliterate(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/[\s_]+/g, '-')       // replace spaces/underscores with hyphens
    .replace(/-+/g, '-')           // dedupe hyphens
    .replace(/(^-|-$)+/g, '');     // trim hyphens from start/end
}

function isVideoExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return [".mp4", ".mov", ".webm", ".m4v"].includes(ext);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 1. Extract and validate text inputs
    const name = formData.get("name") as string;
    const cardType = formData.get("cardType") as string;
    const cardText = formData.get("cardText") as string;
    const cardSize = formData.get("cardSize") as string;
    const industry = formData.get("industry") as string;
    const servicesRaw = formData.get("services") as string;
    const title = formData.get("title") as string;
    const year = formData.get("year") as string;
    const service = formData.get("service") as string;
    const pageIndustry = formData.get("pageIndustry") as string;
    const heroDesc = formData.get("heroDesc") as string;
    const instaUrl = formData.get("instaUrl") as string;
    const brandbookUrl = formData.get("brandbookUrl") as string;
    const showreelUrl = formData.get("showreelUrl") as string;
    const metricsRaw = formData.get("metrics") as string;
    const contentBlocksRaw = formData.get("contentBlocks") as string;

    if (!name || !cardType || !cardText || !cardSize || !title || !year || !service || !pageIndustry || !heroDesc) {
      return NextResponse.json({ error: "Пожалуйста, заполните все обязательные поля." }, { status: 400 });
    }

    interface Metric {
      value: string;
      label: string;
    }

    interface ContentBlock {
      chapter: string;
      text: string;
      items?: string[];
    }

    const services = servicesRaw ? (JSON.parse(servicesRaw) as string[]) : [];
    const metrics: Metric[] = metricsRaw ? (JSON.parse(metricsRaw) as Metric[]) : [];
    const contentBlocks: ContentBlock[] = contentBlocksRaw ? (JSON.parse(contentBlocksRaw) as ContentBlock[]) : [];

    const slug = generateSlug(name);
    if (!slug) {
      return NextResponse.json({ error: "Не удалось сгенерировать корректный URL-слаг из названия кейса." }, { status: 400 });
    }

    // Check if duplicate in cases.ts
    const casesFilePath = path.join(process.cwd(), "src/data/cases.ts");
    let casesContent = await readFile(casesFilePath, "utf8");
    if (casesContent.includes(`href: "/cases/${slug}"`)) {
      return NextResponse.json({ error: `Кейс со слагом "${slug}" уже существует.` }, { status: 400 });
    }

    // 2. Prepare directories
    const caseDir = path.join(process.cwd(), "public", "cases", slug);
    await mkdir(caseDir, { recursive: true });

    // Helper function for local saving
    const saveLocalFile = async (file: File, nameOverride?: string) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = nameOverride || file.name;
      const filePath = path.join(caseDir, filename);
      await writeFile(filePath, buffer);
      return {
        localPath: `/cases/${slug}/${filename}`,
        absolutePath: filePath,
        filename,
      };
    };

    // Helper function for Cloudinary upload
    const uploadToCloudinary = async (absolutePath: string, filename: string) => {
      if (!cloudinaryConfigured) return null;
      try {
        const isVideo = isVideoExtension(filename);
        const result = await cloudinary.uploader.upload(absolutePath, {
          folder: `cases/${slug}`,
          resource_type: isVideo ? "video" : "image",
          use_filename: true,
          unique_filename: false,
        });
        return result.secure_url;
      } catch (err) {
        console.error(`Ошибка загрузки на Cloudinary для ${filename}:`, err);
        return null;
      }
    };

    // 3. Process Cover Media
    const coverFile = formData.get("coverFile") as File | null;
    if (!coverFile) {
      return NextResponse.json({ error: "Пожалуйста, загрузите обложку кейса." }, { status: 400 });
    }

    const localCover = await saveLocalFile(coverFile, `cover${path.extname(coverFile.name)}`);
    const cloudinaryCover = await uploadToCloudinary(localCover.absolutePath, localCover.filename);
    const coverUrl = cloudinaryCover || localCover.localPath;
    const coverUrlIsVideo = isVideoExtension(localCover.filename);

    // Process Cover Poster (if video)
    let coverPosterUrl = "";
    const coverPosterFile = formData.get("coverPosterFile") as File | null;
    if (coverPosterFile) {
      const localPoster = await saveLocalFile(coverPosterFile, `cover-poster${path.extname(coverPosterFile.name)}`);
      const cloudinaryPoster = await uploadToCloudinary(localPoster.absolutePath, localPoster.filename);
      coverPosterUrl = cloudinaryPoster || localPoster.localPath;
    }

    // 4. Process Mockup Images
    const mockupUrls: string[] = [];
    const mockupFiles = formData.getAll("mockupFiles") as File[];
    for (let i = 0; i < mockupFiles.length; i++) {
      const file = mockupFiles[i];
      if (file.size === 0) continue;
      const localMockup = await saveLocalFile(file, `mockup-${i}${path.extname(file.name)}`);
      const cloudinaryMockup = await uploadToCloudinary(localMockup.absolutePath, localMockup.filename);
      mockupUrls.push(cloudinaryMockup || localMockup.localPath);
    }

    // 5. Process Gallery Media
    const galleryFiles = formData.getAll("galleryFiles") as File[];
    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      if (file.size === 0) continue;
      const localGallery = await saveLocalFile(file, `gallery-${i}${path.extname(file.name)}`);
      await uploadToCloudinary(localGallery.absolutePath, localGallery.filename);
    }

    // 6. Update src/data/cases.ts
    const newCaseItemCode = `  // [INSERT_NEW_CASE_HERE]
  {
    name: "${formatTypography(name)}",
    type: "${formatTypography(cardType)}",
    text: "${formatTypography(cardText)}",
    ${coverUrlIsVideo ? `video: "${coverUrl}",` : `image: "${coverUrl}",`}
    ${coverPosterUrl ? `poster: "${coverPosterUrl}",` : ""}
    size: "${cardSize}",
    href: "/cases/${slug}",
    services: ${JSON.stringify(services.map((s: string) => formatTypography(s)))},
    industry: "${formatTypography(industry)}",
  },`;

    casesContent = casesContent.replace("// [INSERT_NEW_CASE_HERE]", newCaseItemCode);
    await writeFile(casesFilePath, casesContent, "utf8");

    // 7. Update src/data/target-cases.ts
    const targetCasesFilePath = path.join(process.cwd(), "src/data/target-cases.ts");
    let targetCasesContent = await readFile(targetCasesFilePath, "utf8");

    const formattedMetrics = metrics.map((m: Metric) => ({
      value: formatTypography(m.value),
      label: formatTypography(m.label),
    }));

    const formattedContentBlocks = contentBlocks.map((b: ContentBlock) => ({
      chapter: formatTypography(b.chapter),
      text: formatTypography(b.text),
      items: b.items ? b.items.map((it: string) => formatTypography(it)) : undefined,
    }));

    const newTargetCaseCode = `    // [INSERT_NEW_TARGET_CASE_HERE]
    "${slug}": {
        title: "${formatTypography(title)}",
        year: "${year}",
        service: "${formatTypography(service)}",
        industry: "${formatTypography(pageIndustry)}",
        hero_desc: "${formatTypography(heroDesc)}",
        ${instaUrl ? `insta_url: "${instaUrl}",` : ""}
        ${brandbookUrl ? `brandbookUrl: "${brandbookUrl}",` : ""}
        ${showreelUrl ? `showreelUrl: "${showreelUrl}",` : ""}
        heroMedia: {
            src: "${coverUrl}",
            type: "${coverUrlIsVideo ? "video" : "image"}"
        },
        ${mockupUrls.length > 0 ? `mockupImages: ${JSON.stringify(mockupUrls)},` : ""}
        metrics: ${JSON.stringify(formattedMetrics, null, 12).replace(/\n\s*\]/g, '\n        ]')},
        contentBlocks: ${JSON.stringify(formattedContentBlocks, null, 12).replace(/\n\s*\]/g, '\n        ]')},
    },`;

    targetCasesContent = targetCasesContent.replace("    // [INSERT_NEW_TARGET_CASE_HERE]", newTargetCaseCode);
    await writeFile(targetCasesFilePath, targetCasesContent, "utf8");

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("Error in case brief creation:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера при создании кейса." }, { status: 500 });
  }
}
