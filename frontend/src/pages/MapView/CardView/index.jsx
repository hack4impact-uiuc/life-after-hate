import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  mapResourceIdSelector,
  mappableResourceSelector,
} from "../../../redux/selectors/map";

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
  defaultHeight: 130,
});

class CardView extends React.Component {
  constructor() {
    super();
    this.state = {
      // Keep a mapping of resource IDs => DOM nodes to be able to scroll on click
      cardRefs: new Map(),
    };
  }

  getRowIdxById = (id) => {
    const { resources } = this.props;
    return resources.findIndex((r) => r._id === id);
  };

  purgeCache = () => {
    cache.clearAll();
    if (this.list) {
      this.list.forceUpdateGrid();
      this.list.scrollToPosition(0);
    }
  };

  componentDidMount = () => this.purgeCache();

  componentDidUpdate(prevProps) {
    const {
      resources: currResourceList,
      selectedResource: currSelectedResource,
    } = this.props;
    const {
      resources: prevResourceList,
      selectedResource: prevSelectedResource,
    } = prevProps;

    if (prevResourceList !== currResourceList) {
      // Purge the cache and scroll to the top now that we've received a new list of resources
      this.purgeCache();
    }

    if (prevSelectedResource !== currSelectedResource) {
      const currResourceIdx = this.getRowIdxById(currSelectedResource);
      const oldResourceIdx = this.getRowIdxById(prevSelectedResource);

      cache.clear(currResourceIdx);
      cache.clear(oldResourceIdx);

      if (this.list) {
        this.list.recomputeRowHeights(0);
      }
    }
  }

  rowRenderer({ index, key, parent, style }) {
    // const source // This comes from your list data

    const { resources, selectedResource } = this.props;
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
            isSelected={resources[index]._id === selectedResource}
            style={style}
          />
          // <div ref={registerChild} style={style}>
          //   "Hi"

          // </div>
        )}
      </CellMeasurer>
    );
  }

  render() {
    const { resources } = this.props;
    return (
      resources.length > 0 && (
        <div className="card-content">
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                ref={(list) => {
                  this.list = list;
                }}
                // Stops focus outline clicking within the list
                style={{ outline: "none" }}
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

const mapStateToProps = (state) => ({
  resources: mappableResourceSelector(state),
  selectedResource: mapResourceIdSelector(state),
});

const mapDispatchToProps = {};

CardView.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedResource: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(CardView);
