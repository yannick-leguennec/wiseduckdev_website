import { v4 as uuidv4 } from "uuid";
import UAParser from "ua-parser-js";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useLoader } from "../../context/LoaderContext";
import { useLanguage } from "../../context/LanguageContext";
import { TranslationsType } from "../../types/TranslationsType";
import GPTs_Categories_Type from "../../types/GPTs_Categories_Type";
import GPTs_Type from "../../types/GPTs_Type";
import Header from "../../components/Header/Header";
import GPTs_Card from "../../components/GPTs_Card/GPTs_Card";
import GPTS_Card_Type from "../../types/GPTs_Card_Type";
const Footer = dynamic(() => import("../../components/Footer/Footer"));
import {
  EmailShareButton,
  FacebookShareButton,
  FacebookMessengerShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";

import {
  EmailIcon,
  FacebookIcon,
  FacebookMessengerIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon,
} from "react-share";
import { TwitterIcon } from "next-share";
import { IoMdShareAlt } from "react-icons/io";
import classes from "../../styles/gptsSlug.module.scss";
import path from "path";

// Define the expected structure for the initial data uploaded
interface initialPageData {
  type: "category" | "gpt";
  category?: GPTs_Categories_Type;
  gpts?: GPTS_Card_Type[];
  gpt?: GPTs_Type;
}

// Define the expected structure for the page data
interface PageData {
  type: "category" | "gpt";
  category?: GPTs_Categories_Type;
  gpts?: GPTS_Card_Type[];
  gpt?: GPTs_Type;
}

// Define the expected structure for the initial data uploaded
export default function GPTsSlug({ initialPageData, deviceType }) {
  // Custom hook to manage the loading state
  const { setLoading } = useLoader();
  // router hook
  const router = useRouter();
  //  Recover the slug from the router
  const { slug } = router.query;
  // Custom hook to manage the language state
  const { activeLanguage } = useLanguage();
  // State to manage the page data
  const [pageData, setPageData] = useState<PageData | null>(initialPageData);
  // Site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  // Determine the GPTs link based on the active language
  const portfolioLink = activeLanguage === "FR" ? `/fr` : `/`;

  // Set loading to false when the component mounts
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // Fetch data when the slug or activeLanguage changes
  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !Array.isArray(slug) || !activeLanguage) return;

      const basePath = "/docs/GPTs/";
      // Use activeLanguage to determine which part of the JSON to fetch
      const categoriesRes = await fetch(`${basePath}gpts_categories.json`);
      const categoriesJson = await categoriesRes.json();
      // Access data using activeLanguage ('EN' or 'FR')
      const languageData = categoriesJson[activeLanguage];

      if (slug.length === 1) {
        // Fetching category data based on slug
        const categoryData = languageData.find((category) =>
          category.path.endsWith(slug[0])
        );

        if (!categoryData) {
          console.error("Category not found");
          return;
        }

        // Fetching related GPTs based on category
        const gptsRes = await fetch(`${basePath}gpts.json`);
        const gptsJson = await gptsRes.json();
        const relatedGpts = gptsJson[activeLanguage].filter((gpt) =>
          gpt.category.includes(slug[0])
        );

        // Update the page data
        setPageData({
          type: "category",
          category: categoryData,
          gpts: relatedGpts,
        });
      } else {
        // Fetching specific GPT data
        const gptsRes = await fetch(`${basePath}gpts.json`);
        const gptsJson = await gptsRes.json();
        const gptData = gptsJson[activeLanguage].find((gpt) =>
          gpt.path.endsWith(`${slug[0]}/${slug[1]}`)
        );

        // Update the page data
        setPageData({
          type: "gpt",
          gpt: gptData,
        });
      }
    };

    // Call the fetchData function
    fetchData();
  }, [slug, activeLanguage]);

  // Button component bringing the user to the search section
  const RedirectToSearchSectionButton = () => {
    return (
      <Link href="/gpts#search" passHref className={classes.buttonReverted}>
        {translation.button[activeLanguage]}
      </Link>
    );
  };

  // Function to handle sharing
  const handleShare = (infos) => {
    if (navigator.share) {
      navigator
        .share({
          title: infos.title,
          url: infos.url,
        })
        .then(() => {
          console.log("Thanks for sharing!");
          if (window.gtag) {
            window.gtag("event", "social_share", {
              event_category: "Social",
              event_share: `${infos.title} was shared via Web Share API`,
            });
          }
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      alert("Your browser doesn't support the Share API");
    }
  };

  // Define the translations
  const translation: TranslationsType = {
    button: {
      EN: "All GPTs",
      FR: "Tous les GPTs",
    },
    buttonRun: {
      EN: "Run",
      FR: "Exécuter",
    },
    share: {
      EN: "Share ",
      FR: "Partager ",
    },
    promo: {
      EN: "Learn more about The Wise Duck Dev ",
      FR: "Apprenez-en plus sur The Wise Duck Dev ",
    },
    tips: {
      EN: "Need some prompting tips ?",
      FR: "Des astuces pour vos prompts ?",
    },
    aria_label_run: {
      EN: "Run the GPT on OpenAI website",
      FR: "Exécuter le GPT sur le site OpenAI",
    },
    og_locale: {
      EN: "en_US",
      FR: "fr_FR",
    },
    buttonCategories: {
      EN: "Share the Collection",
      FR: "Partager la collection",
    },
    aria_label_button_categories: {
      EN: "Share this GPT's category by clicking on this button",
      FR: "Partage cette catégorie de GPT en cliquant sur ce bouton",
    },
    buttonGPTs: {
      EN: "Share this GPT",
      FR: "Partage ce GPT",
    },
    aria_label_button_gpts: {
      EN: "Share this GPT by clicking on this button",
      FR: "Partage ce GPT en cliquant sur ce bouton",
    },
  };

  // Define the schema templates for categories page
  const categoriesSchemaTemplate = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `https://${siteUrl}/gpts/${pageData?.category?.category}`,
    name: pageData?.category?.meta_title_page
      ? pageData.category.meta_title_page
      : "",
    description: pageData?.category?.meta_description_page
      ? pageData.category.meta_description_page
      : "",
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "The Wise Duck Dev GPTs",
      url: `https://${siteUrl}`,
    },
    about: {
      "@type": "ItemList",
      itemListElement: [
        pageData?.gpts?.map((gpt, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@type": "Thing", name: gpt.title },
        })),
      ],
    },
  };

  // Define the schema templates for GPT page
  const gptSchemaTemplate = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `https://${siteUrl}${pageData?.gpt?.path}`,
    name: pageData?.gpt?.meta_title_page ? pageData.gpt.meta_title_page : "",
    description: pageData?.gpt?.meta_description_page
      ? pageData.gpt.meta_description_page
      : "",
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "The Wise Duck Dev GPTs",
      url: `https://${siteUrl}`,
    },
  };

  // Render the page based on the fetched data
  return (
    <>
      {/* HEAD TAG CATEGORIES */}
      {pageData?.type === "category" && pageData.category && (
        <Head>
          <title>{pageData.category.meta_title_page}</title>
          <meta
            name="description"
            content={pageData.category.meta_description_page}
          />
          <meta name="keywords" content={pageData.category.meta_keywords} />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={pageData.category.og_title} />
          <meta
            property="og:description"
            content={pageData.category.og_description}
          />
          <meta
            property="og:url"
            content={
              activeLanguage === "FR"
                ? `https://${siteUrl}/fr/gpts/${pageData.category.category}`
                : `https://${siteUrl}/gpts/${pageData.category.category}`
            }
          />
          <meta
            property="og:image"
            content={`https://${siteUrl}${pageData.category.og_image}`}
          />
          <meta
            property="og:locale"
            content={translation.og_locale[activeLanguage]}
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@wiseduckdev" />
          <meta name="twitter:creator" content="@wiseduckdev" />
          <meta
            name="twitter:title"
            content={pageData.category.twitter_title}
          />
          <meta
            name="twitter:description"
            content={pageData.category.twitter_description}
          />
          <meta
            name="twitter:image"
            content={`https://${siteUrl}${pageData.category.twitter_image}`}
          />
          <meta
            name="twitter:image:alt"
            content={pageData.category.twitter_image_alt}
          />
          {siteUrl && (
            <>
              <link
                rel="alternate"
                hrefLang="en"
                href={`https://${siteUrl}/gpts/${pageData.category.category}`}
              />
              <link
                rel="alternate"
                hrefLang="fr"
                href={`https://${siteUrl}/fr/gpts/${pageData.category.category}`}
              />
            </>
          )}
          <link
            rel="canonical"
            href={
              activeLanguage === "EN"
                ? `https://${siteUrl}/gpts/${pageData.category.category}`
                : `https://${siteUrl}/fr/gpts/${pageData.category.category}`
            }
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(categoriesSchemaTemplate),
            }}
          />
        </Head>
      )}
      {/* HEAD TAG GPT */}
      {pageData?.type === "gpt" && pageData.gpt && (
        <Head>
          <title>{pageData.gpt.meta_title_page}</title>
          <meta
            name="description"
            content={pageData.gpt.meta_description_page}
          />
          <meta name="keywords" content={pageData.gpt.meta_keywords} />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={pageData.gpt.og_title} />
          <meta
            property="og:description"
            content={pageData.gpt.og_description}
          />
          <meta
            property="og:url"
            content={
              activeLanguage === "FR"
                ? `https://${siteUrl}/fr/gpts/${pageData.gpt.og_url}`
                : `https://${siteUrl}/gpts/${pageData.gpt.og_url}`
            }
          />
          <meta
            property="og:image"
            content={`https://${siteUrl}${pageData.gpt.og_image}`}
          />
          <meta
            property="og:locale"
            content={translation.og_locale[activeLanguage]}
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@wiseduckdev" />
          <meta name="twitter:title" content={pageData.gpt.twitter_title} />
          <meta
            name="twitter:description"
            content={pageData.gpt.twitter_description}
          />
          <meta
            name="twitter:image"
            content={`https://${siteUrl}${pageData.gpt.twitter_image}`}
          />
          <meta
            name="twitter:image:alt"
            content={pageData.gpt.twitter_image_alt}
          />
          {siteUrl && (
            <>
              <link
                rel="alternate"
                hrefLang="en"
                href={`https://${siteUrl}${pageData.gpt.path}`}
              />
              <link
                rel="alternate"
                hrefLang="fr"
                href={`https://${siteUrl}/fr${pageData.gpt.path}`}
              />
            </>
          )}
          <link
            rel="canonical"
            href={
              activeLanguage === "EN"
                ? `https://${siteUrl}/gpts/${pageData.gpt.og_url}`
                : `https://${siteUrl}/fr/gpts/${pageData.gpt.og_url}`
            }
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(gptSchemaTemplate),
            }}
          />
        </Head>
      )}

      <Header />

      {/* CATEGORIES PAGE TEMPLATE */}
      {pageData?.type === "category" && pageData.category && (
        <main className={classes.mainContainer}>
          <section className={classes.topContainer}>
            <div className={classes.textContainer}>
              <h1 className={classes.title}>{pageData.category.title}</h1>
              <h2 className={classes.subtitle}>{pageData.category.subtitle}</h2>

              <p className={classes.description}>
                {pageData.category.description}
              </p>

              <div className={classes.socialButtonContainerCategories}>
                {deviceType === "desktop" && (
                  <>
                    <FacebookShareButton
                      url={`https://${siteUrl}/gpts/${pageData.category.category}`}
                      onClick={() => {
                        if (window.gtag) {
                          window.gtag("event", "social_share", {
                            event_category: "Social",
                            event_share: `${pageData.category?.card_title} was shared on Facebook`,
                          });
                        }
                      }}
                    >
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    <FacebookMessengerShareButton
                      url={`https://${siteUrl}/gpts/${pageData.category.category}`}
                      appId="451991680722269"
                      onClick={() => {
                        if (window.gtag) {
                          window.gtag("event", "social_share", {
                            event_category: "Social",
                            event_share: `${pageData.category?.card_title} was shared on Facebook Messenger`,
                          });
                        }
                      }}
                    >
                      <FacebookMessengerIcon size={32} round />
                    </FacebookMessengerShareButton>
                    <WhatsappShareButton
                      url={`https://${siteUrl}/gpts/${pageData.category.category}`}
                      title={pageData.category.meta_title_page}
                      separator=": "
                      onClick={() => {
                        if (window.gtag) {
                          window.gtag("event", "social_share", {
                            event_category: "Social",
                            event_share: `${pageData.category?.card_title} was shared on Whatsapp`,
                          });
                        }
                      }}
                    >
                      <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                    <TwitterShareButton
                      url={`https://${siteUrl}/gpts/${pageData.category.category}`}
                      title={pageData.category.twitter_description}
                      onClick={() => {
                        if (window.gtag) {
                          window.gtag("event", "social_share", {
                            event_category: "Social",
                            event_share: `${pageData.category?.card_title} was shared on Twitter`,
                          });
                        }
                      }}
                    >
                      <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    <LinkedinShareButton
                      url={`https://${siteUrl}/gpts/${pageData.category.category}`}
                      onClick={() => {
                        if (window.gtag) {
                          window.gtag("event", "social_share", {
                            event_category: "Social",
                            event_share: `${pageData.category?.card_title} was shared on Linkedin`,
                          });
                        }
                      }}
                    >
                      <LinkedinIcon size={32} round />
                    </LinkedinShareButton>
                    <TelegramShareButton
                      url={`https://${siteUrl}/gpts/${pageData.category.category}`}
                      title={pageData.category.meta_title_page}
                      onClick={() => {
                        if (window.gtag) {
                          window.gtag("event", "social_share", {
                            event_category: "Social",
                            event_share: `${pageData.category?.card_title} was shared on Telegram`,
                          });
                        }
                      }}
                    >
                      <TelegramIcon size={32} round />
                    </TelegramShareButton>
                    <EmailShareButton
                      url={`https://${siteUrl}/gpts/${pageData.category.category}`}
                      subject={pageData.category.meta_title_page}
                      body={pageData.category.meta_description_page}
                      onClick={() => {
                        if (window.gtag) {
                          window.gtag("event", "social_share", {
                            event_category: "Social",
                            event_share: `${pageData.category?.card_title} was shared on Email`,
                          });
                        }
                      }}
                    >
                      <EmailIcon size={32} round />
                    </EmailShareButton>
                  </>
                )}
                {(deviceType === "mobile" || deviceType === "tablet") && (
                  <button
                    onClick={() =>
                      handleShare({
                        title: pageData.category?.description,
                        url: `https://${siteUrl}/gpts/${pageData.category?.category}`,
                      })
                    }
                    className={classes.shareButton}
                    aria-label={
                      translation.aria_label_button_categories[activeLanguage]
                    }
                  >
                    {translation.buttonCategories[activeLanguage]}{" "}
                    <IoMdShareAlt />
                  </button>
                )}
              </div>
            </div>
            <div className={classes.imageContainer}>
              <img
                src={pageData.category.image}
                alt={pageData.category.alt}
                className={classes.image}
              />
            </div>
          </section>

          <section className={classes.gptsContainer}>
            <h2 className={classes.subtitleBold}>GPTs</h2>
            <div
              className={
                pageData.gpts?.length === 1
                  ? classes.cardsContainer2
                  : classes.cardsContainer
              }
            >
              {pageData.gpts &&
                pageData.gpts
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((gpt) => (
                    <GPTs_Card
                      key={uuidv4()}
                      title={gpt.title}
                      image={gpt.image}
                      alt={gpt.alt}
                      path={gpt.path}
                      card_description={gpt.card_description}
                      category={gpt.category}
                      results={pageData.gpts?.length ?? 0}
                    />
                  ))}
            </div>
            <div className={classes.buttonContainer}>
              <RedirectToSearchSectionButton />
            </div>
            <Link
              href={portfolioLink}
              className={classes.promoText}
              onClick={() => {
                if (window.gtag) {
                  window.gtag("event", "navigation_click", {
                    event_category: "Navigation",
                    event_navigation: `Portfolio was accessed from a Category page`,
                  });
                }
              }}
            >
              {translation.promo[activeLanguage]}{" "}
              <span className={classes.portfolioLinkOrange}>
                {activeLanguage === "FR" ? "ici" : "here"}
              </span>
            </Link>
          </section>
        </main>
      )}
      {/* GPTS PAGE TEMPLATE */}
      {pageData?.type === "gpt" && pageData.gpt && (
        <main className={classes.mainContainer}>
          <div className={classes.topContainer}>
            <div className={classes.textContainer}>
              <h1 className={classes.title}>{pageData.gpt.title}</h1>
              <h2 className={classes.subtitle}>{pageData.gpt.subtitle}</h2>

              <p className={classes.description}>
                {pageData.gpt.page_description}
              </p>
              <h2 className={classes.subtitleBold}>Modes</h2>
              <div className={classes.modesContainer}>
                {pageData.gpt && (
                  <ul>
                    {Object.entries(pageData.gpt.modes).map(
                      ([key, description]) => (
                        <li key={key}>
                          <strong>{key}: </strong> {String(description)}
                        </li>
                      )
                    )}
                  </ul>
                )}
                <div className={classes.tipsContainer}>
                  <Link
                    href={`/gpts/prompting-tips`}
                    className={classes.tipsText}
                    onClick={() => {
                      if (window.gtag) {
                        window.gtag("event", "prompting_tips", {
                          event_category: "PROMPTING_TIPS",
                          event_tips: `Prompting tips were accessed from ${pageData.gpt?.title} page`,
                        });
                      }
                    }}
                  >
                    {" "}
                    {translation.tips[activeLanguage]}
                  </Link>
                </div>
              </div>
            </div>
            <div className={classes.imageContainer}>
              <img
                src={pageData.gpt.image}
                alt={pageData.gpt.alt}
                className={classes.image}
              />
            </div>
          </div>
          <div className={classes.downContainer}>
            <div className={classes.socialButtonContainerGPTs}>
              {deviceType === "desktop" && (
                <>
                  <FacebookShareButton
                    url={`https://${siteUrl}/gpts${pageData.gpt.path}`}
                    onClick={() => {
                      if (window.gtag) {
                        window.gtag("event", "social_share", {
                          event_category: "Social",
                          event_share: `${pageData.gpt?.title} was shared on Facebook`,
                        });
                      }
                    }}
                  >
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                  <FacebookMessengerShareButton
                    url={`https://${siteUrl}/gpts${pageData.gpt.path}`}
                    appId="451991680722269"
                    onClick={() => {
                      if (window.gtag) {
                        window.gtag("event", "social_share", {
                          event_category: "Social",
                          event_share: `${pageData.gpt?.title} was shared on Facebook Messenger`,
                        });
                      }
                    }}
                  >
                    <FacebookMessengerIcon size={32} round />
                  </FacebookMessengerShareButton>
                  <WhatsappShareButton
                    url={`https://${siteUrl}/gpts${pageData.gpt.path}`}
                    title={pageData.gpt.meta_title_page}
                    separator=": "
                    onClick={() => {
                      if (window.gtag) {
                        window.gtag("event", "social_share", {
                          event_category: "Social",
                          event_share: `${pageData.gpt?.title} was shared on Whatsapp`,
                        });
                      }
                    }}
                  >
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                  <TwitterShareButton
                    url={`https://${siteUrl}/gpts${pageData.gpt.path}`}
                    title={pageData.gpt.twitter_description}
                    onClick={() => {
                      if (window.gtag) {
                        window.gtag("event", "social_share", {
                          event_category: "Social",
                          event_share: `${pageData.gpt?.title} was shared on Twitter`,
                        });
                      }
                    }}
                  >
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                  <LinkedinShareButton
                    url={`https://${siteUrl}/gpts${pageData.gpt.path}`}
                    onClick={() => {
                      if (window.gtag) {
                        window.gtag("event", "social_share", {
                          event_category: "Social",
                          event_share: `${pageData.gpt?.title} was shared on Linkedin`,
                        });
                      }
                    }}
                  >
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                  <TelegramShareButton
                    url={`https://${siteUrl}/gpts${pageData.gpt.path}`}
                    title={pageData.gpt.meta_title_page}
                    onClick={() => {
                      if (window.gtag) {
                        window.gtag("event", "social_share", {
                          event_category: "Social",
                          event_share: `${pageData.gpt?.title} was shared on Telegram`,
                        });
                      }
                    }}
                  >
                    <TelegramIcon size={32} round />
                  </TelegramShareButton>
                  <EmailShareButton
                    url={`https://${siteUrl}/gpts${pageData.gpt.path}`}
                    subject={pageData.gpt.meta_title_page}
                    body={pageData.gpt.meta_description_page}
                    onClick={() => {
                      if (window.gtag) {
                        window.gtag("event", "social_share", {
                          event_category: "Social",
                          event_share: `${pageData.gpt?.title} was shared on Email`,
                        });
                      }
                    }}
                  >
                    <EmailIcon size={32} round />
                  </EmailShareButton>
                </>
              )}
              {(deviceType === "mobile" || deviceType === "tablet") && (
                <button
                  onClick={() =>
                    handleShare({
                      title: pageData.gpt?.meta_description_page,
                      url: `https://${siteUrl}/gpts${pageData.gpt?.path}`,
                    })
                  }
                  className={classes.shareButton}
                >
                  {translation.buttonGPTs[activeLanguage]} <IoMdShareAlt />
                </button>
              )}
            </div>
            <div className={classes.buttonContainer}>
              <RedirectToSearchSectionButton />
              <Link
                href={pageData.gpt.openAi_link}
                passHref
                className={classes.buttonRun}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={translation.aria_label_run[activeLanguage]}
                onClick={() => {
                  if (window.gtag) {
                    window.gtag("event", "run_gpt", {
                      event_category: "RUN_GPT",
                      event_run: `${pageData.gpt?.title} was run`,
                    });
                  }
                }}
              >
                {translation.buttonRun[activeLanguage]}
              </Link>
            </div>
          </div>
          <Link
            href={portfolioLink}
            className={classes.promoText}
            onClick={() => {
              if (window.gtag) {
                window.gtag("event", "navigation_click", {
                  event_category: "Navigation",
                  event_navigation: `Portfolio was accessed from a GPT page`,
                });
              }
            }}
          >
            {translation.promo[activeLanguage]}{" "}
            <span className={classes.portfolioLinkOrange}>
              {activeLanguage === "FR" ? "ici" : "here"}
            </span>
          </Link>
        </main>
      )}

      <Footer />
      <SpeedInsights />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params, locale } = context;
  const fs = require("fs");

  const parser = new UAParser(context.req.headers["user-agent"]);
  const result = parser.getResult();
  const deviceType: string = result.device.type || "desktop"; // Fallback to 'desktop' if no device type is found

  // Ensure slug is treated as string[]
  const slug = params?.slug as string[];
  // Convert the locale to the active language
  const lang = locale === "fr" ? "FR" : "EN";

  // Define the path to your JSON files
  const basePath = path.join(process.cwd(), "public/docs/GPTs");
  const categoriesFilePath = path.join(basePath, "gpts_categories.json");
  const gptsFilePath = path.join(basePath, "gpts.json");

  // Function to read and parse JSON files
  const readJson = (filePath: string) =>
    JSON.parse(fs.readFileSync(filePath, "utf8"));

  try {
    // Read and parse the JSON files
    const categoriesData = readJson(categoriesFilePath)[lang];
    const gptsData = readJson(gptsFilePath)[lang];

    let initialPageData: initialPageData;

    if (slug.length === 1) {
      const categoryData = categoriesData.find((category) =>
        category.path.endsWith(slug[0])
      );
      if (!categoryData) {
        return { notFound: true };
      }
      const relatedGpts = gptsData.filter((gpt) =>
        gpt.category.includes(slug[0])
      );
      initialPageData = {
        type: "category",
        category: categoryData,
        gpts: relatedGpts,
      };
    } else {
      const gptData = gptsData.find((gpt) =>
        gpt.path.endsWith(`${slug[0]}/${slug[1]}`)
      );
      if (!gptData) {
        return { notFound: true };
      }
      initialPageData = { type: "gpt", gpt: gptData };
    }

    return {
      props: {
        initialPageData,
        deviceType,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    // Ensure the return of a valid object even in the error case
    return {
      props: {}, // You might want to pass some default error props
      notFound: true, // Optionally use this or redirect depending on error handling strategy
    };
  }
};
