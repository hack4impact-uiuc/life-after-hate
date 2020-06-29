import { connect } from "react-redux";
import { roleEnum } from "../../utils/enums";
import PropTypes from "prop-types";

const AdminView = ({ role, children }) =>
  role === roleEnum.ADMIN ? children : null;

const mapStateToProps = (state) => ({
  role: state.auth.role,
});

AdminView.propTypes = {
  role: PropTypes.oneOf(Object.values(roleEnum)),
};

export default connect(mapStateToProps)(AdminView);
