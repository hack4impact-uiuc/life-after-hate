import { connect } from "react-redux";
import { roleEnum } from "../../utils/enums";
const AdminView = ({ role, children }) =>
  role === roleEnum.ADMIN ? children : null;
const mapStateToProps = (state) => ({
  role: state.auth.role,
});
export default connect(mapStateToProps)(AdminView);
