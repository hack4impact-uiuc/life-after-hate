import React from "react";
import ResourceCard from "../ResourceCard";

import {
  CellMeasurer,
  List,
  AutoSizer,
  CellMeasurerCache,
} from "react-virtualized";

const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultWidth: 324,
  defaultHeight: 150,
});

class ResourceList extends React.Component {
  constructor() {
    super();
    window.addEventListener("resize", () => cache.clearAll());
  }

  purgeCache = () => {
    cache.clearAll();
    if (this.list) {
      this.list.forceUpdateGrid();
      this.list.scrollToPosition(0);
    }
  };

  componentDidUpdate = () => this.purgeCache();

  rowRenderer({ index, key, parent, style }) {
    const { resources } = this.props;
    // const source // This comes from your list data
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({ registerChild }) => (
          // 'style' attribute required to position cell (within parent List)
          <ResourceCard
            key={resources[index]._id}
            ref={registerChild}
            resource={resources[index]}
            style={style}
          />
        )}
      </CellMeasurer>
    );
  }

  render() {
    const { resources } = this.props;
    return (
      resources.length > 0 && (
        <AutoSizer>
          {({ width }) => (
            <List
              width={width}
              height={500}
              ref={(list) => {
                this.list = list;
              }}
              deferredMeasurementCache={cache}
              rowHeight={cache.rowHeight}
              rowRenderer={this.rowRenderer.bind(this)}
              rowCount={resources.length}
            />
          )}
        </AutoSizer>
      )
    );
  }
}

export default ResourceList;
