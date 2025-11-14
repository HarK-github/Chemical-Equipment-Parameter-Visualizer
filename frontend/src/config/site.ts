export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Chemical Equipment Visualizer",
  description:
    "Upload, analyze, and visualize chemical equipment parameters with ease.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Login",
      href: "/login",
    },
    {
      label: "Logout",
      href: "/logout",
    }
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/HarK-github/Chemical-Equipment-Parameter-Visualizer",
  },
};
