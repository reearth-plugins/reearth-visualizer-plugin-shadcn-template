import html from "@distui/demo/main/index.html?raw";

import { GlobalThis, MouseEvent } from "@/shared/reearthTypes";

const reearth = (globalThis as unknown as GlobalThis).reearth;
reearth.ui.show(html);

// Demo of get message from UI
reearth.on("message", (msg: { action: string; payload?: unknown }) => {
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

const handleMouseMove = (e: MouseEvent) => {
  // Demo of post message to UI
  reearth.ui.postMessage({
    action: "mouseMove",
    payload: e,
  });
};
reearth.on("mousemove", handleMouseMove);

// Post message to UI when initialize
// This is a little bit special since binding event listener on UI
// by react usually is not ready at this moment.
// We need to add a data transformer to hold the initial message
// Please check ./main/index.html for more details
reearth.ui.postMessage({
  action: "__init__",
  payload: {
    primaryColor: reearth.widget?.property?.appearance?.primary_color,
  },
});
