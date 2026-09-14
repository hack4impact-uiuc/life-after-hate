import React from "react";
import PropTypes from "prop-types";
import ResourceCard from "../ResourceCard";
import {
  CellMeasurer,
  List,
  AutoSizer,
  CellMeasurerCache,
} from "react-virtualized";
import "./styles.scss";
const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultWidth: 324,
  defaultHeight: 300,
});

class ResourceList extends React.Component {
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    cache.clearAll();
    this.list?.recomputeRowHeights();
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  purgeCache = () => {
    cache.clearAll();
    if (this.list) {
      this.list.forceUpdateGrid();
      this.list.scrollToPosition(0);
    }
  };

  componentDidUpdate = (previous) => {
    if (
      previous.resources !== this.props.resources ||
      previous.density !== this.props.density
    ) {
      this.purgeCache();
      this.list?.recomputeRowHeights();
    }
  };

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
        {({ registerChild, measure }) => (
          // 'style' attribute required to position cell (within parent List)
          <div ref={registerChild} style={style}>
            <ResourceCard
              key={resources[index]._id}
              resource={resources[index]}
              measure={measure}
            />
          </div>
        )}
      </CellMeasurer>
    );
  }

  render() {
    const { resources } = this.props;
    return (
      resources.length > 0 && (
        <div
          className="resource-list"
          style={{
            "--directory-rows-height": `${resources.length * (this.props.density === "compact" ? 70 : 90)}px`,
          }}
        >
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
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
        </div>
      )
    );
  }
}

ResourceList.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.object).isRequired,
  density: PropTypes.string,
};

export default ResourceList;
