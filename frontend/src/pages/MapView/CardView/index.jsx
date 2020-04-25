import React from "react";
import { connect } from "react-redux";
import { mappableResourceSelector , mapResourceIdSelector } from "../../../redux/selectors/map";
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

  componentDidUpdate(prevProps) {
    if (prevProps.selectedResource) {
      const prevResourceIdx = this.props.resources.findIndex(
        (r) => r._id === prevProps.selectedResource
      );
      cache.clear(prevResourceIdx, 0);
      this.list.recomputeRowHeights();
      console.log("CLEARED");
    }
    if (this.props.selectedResource) {
      const currResourceIdx = this.props.resources.findIndex(
        (r) => r._id === this.props.selectedResource
      );
      cache.clear(currResourceIdx, 0);
      this.list.recomputeRowHeights();
      const firstOffset = this.list.getOffsetForRow({
        alignment: "start",
        index: currResourceIdx,
      });
      this.list.scrollToPosition(firstOffset);
      setTimeout(() => {
        console.log(this.list.Grid);
        this.list.scrollToPosition(
          this.list.getOffsetForRow({
            alignment: "start",
            index: currResourceIdx,
          })
        );
      }, 500);
    }
  }

  rowRenderer({ index, key, parent, style }) {
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
            key={this.props.resources[index]._id}
            ref={registerChild}
            resource={this.props.resources[index]}
            isSelected={
              this.props.resources[index]._id === this.props.selectedResource
            }
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
    return (
      this.props.resources.length > 0 && (
        <div className="card-content">
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
                rowCount={this.props.resources.length}
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

export default connect(mapStateToProps, mapDispatchToProps)(CardView);
