"use strict";
import React from 'react';

class QuoteInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  componentDidMount() {
    if (this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }  

  handleChange = (event) => {
    this.setState({ value: event.target.value });
    this.props.onChange(event.target.value);
  }

  
  render() {    
    const { type, title } = this.props;

    if (type === 'textarea') {
      return (
        <div className={`input-group ${this.props.className} ${this.state.value ? '--filled' : ''}`}>
          <textarea
            onChange={this.handleChange}
            value={this.state.value}
            defaultValue={this.state.value}
            placeholder=""
          />
          <label>{title}</label>
        </div>
      );
    }

    return (
      <div className={`input-group ${this.props.className} ${this.state.value ? '--filled' : ''}`}>
        <input
          type={type}
          value={this.state.value}
          onChange={this.handleChange}
          placeholder=""
        />
        <label>{title}</label>
      </div>
    );
  }
}

export default QuoteInput;