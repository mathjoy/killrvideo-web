import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';

import { Link } from 'react-router';
import { Row, Col, Alert } from 'react-bootstrap';
import RegistrationForm from './registration-form';
import ErrorAlert from 'components/shared/error-alert';
import { register, registerReset } from 'actions/authentication';

class Register extends Component {
  componentWillMount() {
    // Reset page validation when loading
    this.props.registerReset();
  }
  
  componentWillReceiveProps(nextProps) {
    // Redirect the user after registering and being logged in
    if (this.props.isLoggedIn === false && nextProps.isLoggedIn === true) {
      const { location: { state } } = this.props;
      if (state && state.redirectAfterLogin) {
        this.props.push(state.redirectAfterLogin);
      } else {
        this.props.push('/');
      }
    }
  }
    
  render() {
    return (
      <div className="body-content container">
        <Row>
          <Col md={6} mdOffset={3}>
            <h2>Register</h2>
            
            <Alert bsStyle="info">
              Register for an account to upload and comment on videos.
            </Alert>
            
            <ErrorAlert errors={this.props.registerState.errors} />
            
            <RegistrationForm onSubmit={vals => this.props.register(vals.firstName, vals.lastName, vals.email, vals.password)} />
          </Col>
        </Row>
      </div>
    );
  }
}

// Prop validation
Register.propTypes = {
  // State from redux
  registerState: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  
  // From react-router
  location: PropTypes.object.isRequired,
  
  // Actions
  register: PropTypes.func.isRequired,
  registerReset: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  let { 
    authentication: { 
      register: registerState, 
      currentUser: { isLoggedIn } 
    } 
  } = state;
  return { registerState, isLoggedIn };
}

export default connect(mapStateToProps, { register, registerReset, push: routeActions.push })(Register);