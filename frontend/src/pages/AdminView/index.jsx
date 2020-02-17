import React, { useEffect } from "react";
import { refreshAllUsers } from "../../utils/api";
import { connect } from "react-redux";
import { userSelector } from "../../redux/selectors/users";
//import { UserCard } from "./UserCard"; TODO: implement UserCard
import "./styles.scss";

const UserManager = props => {
  useEffect(() => {
    refreshAllUsers();
    console.log("hooook");
  }, []);

  // const renderCards = user => (
  //     <UserCard key={user._id} user={user} />
  // );

  return (
    <div className="directory">
      <div className="manager-header">
        <h1>User Directory</h1>
      </div>

      <div className="users">
        <div className="user-labels clearfix">
          <div className="col">
            <h3>Name</h3>
          </div>
          <div className="col">
            <h3>Email</h3>
          </div>
          <div className="col">
            <h3>Account Type</h3>
          </div>
          <div className="col">
            <h3>Title</h3>
          </div>
          <div />
        </div>
        {props.users /*&& props.users.map(renderCards)*/}
      </div>
    </div>
  );
};

const MapStateToProps = state => ({
  users: userSelector(state)
});

//   const mapDispatchToProps = { TODO: make user modal
//     openModal
//   };

export default connect(MapStateToProps)(UserManager);
