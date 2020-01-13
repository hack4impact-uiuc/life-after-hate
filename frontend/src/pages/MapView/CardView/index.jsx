import React from "react";
import { connect } from "react-redux";
import { resourceSelector } from "../../../redux/selectors/resource";
import ResourceCard from "../ResourceCard";

const CardView = props => {
  const renderCard = card => <ResourceCard key={card._id} resource={card} />;

  return (
    props.resources.length > 0 && (
      <div className="card-content">{props.resources.map(renderCard)}</div>
    )
  );
};

const mapStateToProps = state => ({
  resources: resourceSelector(state)
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardView);
