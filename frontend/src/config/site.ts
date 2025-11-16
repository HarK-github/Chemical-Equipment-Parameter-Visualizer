export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Chemical Equipment Visualizer",
  description:
    "Upload, analyze, and visualize chemical equipment parameters with ease.",

  navItems: [
    {
      label: "Home",
      href: "/",
      auth: "both",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      auth: "private",
    },
    {
      label: "Login",
      href: "/login",
      auth: "public",
    },
    {
      label: "Logout",
      href: "/logout",
      auth: "private",
    },
  ],

  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
      auth: "private",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      auth: "private",
    },
    {
      label: "Settings",
      href: "/settings",
      auth: "private",
    },
    {
      label: "Logout",
      href: "/logout",
      auth: "private",
    },
  ],

  links: {
    github:
      "https://github.com/HarK-github/Chemical-Equipment-Parameter-Visualizer",
  },
};
