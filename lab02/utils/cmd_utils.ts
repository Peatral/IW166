export function setBackground(imagePath: string) {
  const command = new Deno.Command("gsettings", {
    args: [
      "set",
      "org.gnome.desktop.background",
      "picture-uri",
      imagePath,
    ],
  });
  command.outputSync();
}

export function getBackground() {
  const command = new Deno.Command("gsettings", {
    args: [
      "get",
      "org.gnome.desktop.background",
      "picture-uri",
    ],
  });
  const { stdout } = command.outputSync();
  return new TextDecoder().decode(stdout).trim();
}
