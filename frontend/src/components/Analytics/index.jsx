import LogRocket from "logrocket";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { roleEnum } from "../../utils/enums";
if (process.env.REACT_APP_LOGROCKET_ACCESS_TOKEN) {
  LogRocket.init(process.env.REACT_APP_LOGROCKET_ACCESS_TOKEN);
}
// LogRocket.init("znq4bo/life-after-hate-prod");
const Analytics = ({ firstName, lastName, email, role }) => {
  if (email && process.env.REACT_APP_LOGROCKET_ACCESS_TOKEN) {
    LogRocket.identify(email, {
      name: `${firstName} ${lastName}`,
      email,
      role,
    });
  }
  return null;
};

const mapStateToProps = (state) => ({
  firstName: state.auth.firstName,
  lastName: state.auth.lastName,
  email: state.auth.email,
  role: state.auth.role,
});

const mapDispatchToProps = {};

Analytics.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  email: PropTypes.string,
  role: PropTypes.oneOf(Object.values(roleEnum)),
};

export default connect(mapStateToProps, mapDispatchToProps)(Analytics);
