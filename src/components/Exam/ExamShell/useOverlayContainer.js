import { useEffect, useState } from "react";

// react-bootstrap popovers and react-select menus portal to document.body by
// default. That breaks the moment the exam goes fullscreen: the browser renders
// only the fullscreen element's own subtree, so an overlay parked on
// document.body is still in the DOM but never painted - you click a
// transaction and nothing appears.
//
// Portalling into the fullscreen element instead keeps overlays inside the
// rendered subtree. Outside fullscreen this is document.body, exactly as before.
export const getOverlayContainer = () =>
  document.fullscreenElement ?? document.body;

export const useOverlayContainer = () => {
  const [container, setContainer] = useState(getOverlayContainer);

  useEffect(() => {
    const sync = () => setContainer(getOverlayContainer());

    document.addEventListener("fullscreenchange", sync);
    sync();

    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  return container;
};

export default useOverlayContainer;
