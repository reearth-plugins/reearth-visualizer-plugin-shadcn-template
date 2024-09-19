import html from "@distui/demo/main/index.html?raw";

import { GlobalThis, MouseEventProps } from "@/shared/reearthTypes";

const reearth = (globalThis as unknown as GlobalThis).reearth;
reearth.ui.show(html);

// Get message from UI
// eslint-disable-next-line @typescript-eslint/no-explicit-any
reearth.extension.on("message", (msg: { action: string; payload?: any }) => {
  if (msg.action === "flyToTokyo") {
    reearth.camera.flyTo(
      {
        lat: 35.68505398711427,
        lng: 139.75584459383325,
        height: 5000,
      },
      { duration: 1 }
    );
  }
});

const handleMouseMove = (e: MouseEventProps) => {
  // Post message to UI
  reearth.ui.postMessage({
    action: "mouseMove",
    payload: e,
  });
};

reearth.viewer.on("mouseMove", handleMouseMove);

// Post message to UI when initialize
// !! NOTE !! You don't need to use this unless you need some initialize on first render

// Binding event listener on UI by react will not be ready at this moment.
// We need to add a data transformer to hold the initial message
// Please check ./main/index.html for more details
reearth.ui.postMessage({
  action: "__init__",
  payload: {
    primaryColor: reearth.extension.widget?.property?.appearance?.primary_color,
  },
});
