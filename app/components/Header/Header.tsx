"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import Image from "next/image";
import logo from "../../public/images/fake_logo.png";
import { GiHamburgerMenu } from "react-icons/gi";
import classes from "./Header.module.scss";
import { TranslationsType } from "@/app/types/TranslationsType";

function Header() {
  const [activeSection, setActiveSection] = useState("");

  const { activeLanguage, toggleLanguage } = useLanguage();

  // Allow to detect the current section when the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.1;

      const sections = [
        "main",
        "profil",
        "skills",
        "experience",
        "portfolio",
        "contact",
      ];
      const currentSection = sections.find((section) => {
        const el = document.getElementById(section);
        if (el) {
          const sectionTop = el.offsetTop;
          const sectionHeight = el.offsetHeight;
          return (
            scrollPosition >= sectionTop &&
            scrollPosition <= sectionTop + sectionHeight
          );
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Function to add the active class to the current section
  const isActive = (sectionName: string) =>
    activeSection === sectionName ? classes.activeLink : "";

  // This function is used to scroll to the section when the user clicks on the navigation buttons
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - window.innerHeight * (6 / 100);

      requestAnimationFrame(() => {
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      });
    }
  };

  const translations: TranslationsType = {
    main: { EN: "Main", FR: "Accueil" },
    profil: { EN: "Profile", FR: "Profil" },
    skills: { EN: "Skills", FR: "Compétences" },
    experience: { EN: "Experience", FR: "Expérience" },
    portfolio: { EN: "Portfolio", FR: "Portfolio" },
    contact: { EN: "Contact", FR: "Contact" },
  };

  return (
    <header className={classes.header}>
      <a
        href="#main"
        tabIndex={0}
        onClick={() => scrollToSection("main")}
        className={`${classes.containerLogo}`}
      >
        <Image
          src={logo}
          alt="Site Logo"
          width={50}
          height={50}
          className={classes.logo}
        />
        <h1 className={classes.logoName}>The Wise Duck</h1>
      </a>
      <div className={classes.containerNav}>
        <nav className={classes.navigation}>
          <ul className={classes.navList}>
            {Object.keys(translations).map((key: string) => (
              <li key={key} className={classes.navItem}>
                <a
                  href={`#${key}`}
                  tabIndex={0}
                  className={`${classes.navLink} ${isActive(key)}`}
                  onClick={() => scrollToSection(key)}
                >
                  {translations[key][activeLanguage]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={classes.buttonsContainer}>
          <button
            className={`${classes.buttonLang} ${
              activeLanguage === "EN"
                ? classes.activeButton
                : classes.inactiveButton
            }`}
            onClick={() => toggleLanguage("EN")}
          >
            EN
          </button>
          <button
            className={`${classes.buttonLang} ${
              activeLanguage === "FR"
                ? classes.activeButton
                : classes.inactiveButton
            }`}
            onClick={() => toggleLanguage("FR")}
          >
            FR
          </button>
        </div>
      </div>
      <div
        role="burger menu button"
        tabIndex={0}
        aria-expanded="false"
        className={classes.containerBurger}
      >
        <GiHamburgerMenu className={classes.hamburger} />
      </div>
    </header>
  );
}

export default Header;
