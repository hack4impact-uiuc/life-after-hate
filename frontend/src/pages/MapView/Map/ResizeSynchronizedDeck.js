import { Deck } from "@deck.gl/core";
import { flushSync } from "react-dom";

export default class ResizeSynchronizedDeck extends Deck {
  redraw(reason) {
    const resized =
      this.width !== this.lastDrawnWidth ||
      this.height !== this.lastDrawnHeight;
    this.lastDrawnWidth = this.width;
    this.lastDrawnHeight = this.height;

    // Resizing clears the WebGL drawing buffer. DeckGL 8 defers its redraw
    // until React updates the child map; React 18 can otherwise paint the
    // cleared buffer first. Commit that update within the resize frame.
    if (resized) {
      flushSync(() => super.redraw(reason));
    } else {
      super.redraw(reason);
    }
  }
}
