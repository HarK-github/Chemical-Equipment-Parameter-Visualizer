import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { useSelector } from "react-redux";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon } from "@/components/icons";
import { RootState } from "@/store/store";
export const Navbar = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <p className="font-bold text-inherit">ChemEquip</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {siteConfig.navItems
          .filter((item) => {
            if (item.auth === "both") return true;
            if (item.auth === "public" && !isLoggedIn) return true;
            if (item.auth === "private" && isLoggedIn) return true;

            return false;
          })
          .map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem>
          <Link isExternal href={siteConfig.links.github} title="GitHub">
            <GithubIcon className="text-default-500" />
          </Link>
        </NavbarItem>
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile Menu Items */}
      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems
            .filter((item) => {
              if (item.auth === "both") return true;
              if (item.auth === "public" && !isLoggedIn) return true;
              if (item.auth === "private" && isLoggedIn) return true;

              return false;
            })
            .map((item, index) => (
              <NavbarMenuItem key={`${item.href}-${index}`}>
                <Link color="foreground" href={item.href} size="lg">
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
