import React, { Component } from 'react'

import createComponent from '../../lib/createComponent'
import { percent, ratio, usd } from '../../../common/lib'

const thumbWidth = '16px'
const thumbHeight = '16px'
const thumbColor = '#888'
const thumbHoverColor = '#777'
const thumbBorderWidth = '0'
const thumbBorderColor = 'none'
const thumbRadius = '999px'

const trackWidth = '100%'
const trackHeight = '4px'
const trackColor = '#ddd'
const trackHoverColor = '#ccc'
const trackBorderWidth = '0'
const trackBorderColor = 'none'
const trackRadius = '0'

const track = {
  transition: 'background 0.15s',
  cursor: 'pointer',
  height: trackHeight,
  width: trackWidth,
  borderRadius: trackRadius,
}

const thumb = {
  transition: 'transform 0.15s, height 0.15s',
  overflow: 'visible',
  width: thumbWidth,
  height: trackHeight,
  border: `${thumbBorderWidth} solid ${thumbBorderColor}`,
  borderRadius: thumbRadius,
  cursor: 'pointer',
  transform: `translateY(${thumbHeight} / 2 - ${trackHeight} / 2)`,
}

const hoverFocus = {
  outline: 0,

  '&::-webkit-slider-thumb': {
    background: thumbHoverColor,
    height: thumbHeight,
    transform: 'translateY(0)',
  },

  '&::-moz-range-thumb': {
    background: thumbHoverColor,
    height: thumbHeight,
  },

  '&::-ms-thumb': {
    background: thumbHoverColor,
    height: thumbHeight,
  },
  '&::-webkit-slider-runnable-track': {
    background: trackHoverColor,
  },
  '&::-ms-fill-lower': {
    background: trackHoverColor,
  },
  '&::-ms-fill-upper': {
    background: thumbHoverColor,
  },
}

export const rules = {
  root: props => {
    return Object.assign({
      WebkitAppearance: 'none',
      margin: `${parseInt(thumbHeight, 10) / 2}px 0`,
      width: trackWidth,

      onFocus: hoverFocus,
      onHover: hoverFocus,
      '&::-webkit-slider-runnable-track': {
        ...track,
        background: trackColor,
        border: `${trackBorderWidth} solid ${trackBorderColor}`,
        borderRadius: trackRadius,
      },
      '&::-webkit-slider-thumb': {
        ...thumb,
        WebkitAppearance: 'none',
        marginTop: (-trackBorderWidth * 2 + trackHeight) / 2 - thumbHeight / 2,
      },
      '&::-moz-range-track': {
        ...track,
        background: trackColor,
        border: `${trackBorderWidth} solid ${trackBorderColor}`,
        borderRadius: trackRadius,
      },
      '&::-moz-range-thumb': {
        ...thumb,
      },
      '&::-ms-track': {
        ...track,
        background: 'transparent',
        borderColor: 'transparent',
        borderWidth: thumbHeight / 2,
        color: 'transparent',
      },
      '&::-ms-fill-lower': {
        background: thumbHoverColor,
        border: `${trackBorderWidth} solid ${trackBorderColor}`,
        borderRadius: trackRadius * 2,
      },
      '&::-ms-fill-upper': {
        background: trackColor,
        border: `${trackBorderWidth} solid ${trackBorderColor}`,
        borderRadius: trackRadius * 2,
      },
      '&::-ms-thumb': {
        ...thumb,
        marginTop: 0,
      },
    })
  },
  value: props => ({
    float: 'right',
  }),
  input: props => ({
    float: 'right',
    padding: 0,
    maxWidth: '4rem',
    textAlign: 'right',
    border: 'none',
    onFocus: {
      outline: 'none',
    },
  }),
}

class Slider extends Component {
  state = {}

  static defaultProps = {
    value: 0,
  }

  handleChange = e => {
    const { onChange } = this.props
    if (onChange) onChange(e)
  }

  handleInputKeyDown = e => {
    const { keyCode } = e
    if (keyCode === 13 || keyCode === 27) {
      e.nativeEvent.stopImmediatePropagation()
      e.preventDefault()
      e.stopPropagation()
      this.hideInput(e)
    }
  }

  handleSliderKeyDown = e => {
    const { keyCode, target: { value } } = e
    // number row keys
    if (keyCode >= 48 && keyCode <= 57) {
      this.handleChange(e)
      this.showInput()
    }
  }

  handleInputRef = ref => {
    if (!ref) return
    this.inputRef = ref
    this.inputRef.focus()
    this.inputRef.select()
  }

  showInput = e => this.setState(() => ({ showInput: true }))

  hideInput = e => {
    this.handleChange(e)
    this.setState(() => ({ showInput: false }))
  }

  render() {
    const { ElementType, styles, theme, label, onChange, unit, value, ...rest } = this.props
    const { showInput } = this.state

    let readout = value
    if (unit === 'usd') readout = usd(value)
    if (unit === 'ratio') readout = ratio(value)
    if (unit === 'percent') readout = percent(value)

    return (
      <ElementType {...rest}>
        {label}
        {showInput ? (
          <input
            ref={this.handleInputRef}
            onBlur={this.hideInput}
            onKeyDown={this.handleInputKeyDown}
            defaultValue={value}
            className={styles.input}
          />
        ) : (
          <div onClick={this.showInput} className={styles.value}>
            {readout}
          </div>
        )}
        <input
          {...rest}
          type="range"
          onKeyDown={this.handleSliderKeyDown}
          onChange={this.handleChange}
          value={value}
        />
      </ElementType>
    )
  }
}

export default createComponent({ rules })(Slider)
