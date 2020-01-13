import React from "react";
import { connect } from "react-redux";
import { resourceSelector } from "../../../redux/selectors/resource";
import ResourceCard from "../ResourceCard";
import { mapResourceIdSelector } from "../../../redux/selectors/map";

class CardView extends React.Component {
  constructor() {
    super();
    this.state = {
      // Keep a mapping of resource IDs => DOM nodes to be able to scroll on click
      cardRefs: new Map()
    };
  }

  renderCard = card => {
    // Prevent unnecessary prop changing by reusing ref if possible
    let ref = this.state.cardRefs.get(card._id);
    if (!ref) {
      ref = React.createRef();
      this.state.cardRefs.set(card._id, ref);
    }
    return (
      <ResourceCard
        key={card._id}
        myRef={ref}
        resource={card}
        isSelected={card._id === this.props.selectedResource}
      />
    );
  };

  componentDidUpdate() {
    if (this.props.selectedResource) {
      this.state.cardRefs
        .get(this.props.selectedResource)
        .current.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }
  render() {
    console.log("Hi");
    return (
      this.props.resources.length > 0 && (
        <div className="card-content">
          {this.props.resources.map(this.renderCard)}
        </div>
      )
    );
  }
}

const mapStateToProps = state => ({
  resources: resourceSelector(state),
  selectedResource: mapResourceIdSelector(state)
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardView);
