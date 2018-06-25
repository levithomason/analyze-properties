import _ from 'lodash/fp'
import * as React from 'react'

import createComponent from '../../lib/createComponent'
import { percent, ratio, usd } from '../../../common/lib'
import keyboardKey from 'keyboard-key'

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
  background: thumbColor,
  border: `${thumbBorderWidth} solid ${thumbBorderColor}`,
  borderRadius: thumbRadius,
  cursor: 'pointer',
}

const hoverFocusThumb = {
  background: thumbHoverColor,
  height: thumbHeight,
  transform: `translateY(calc(-${thumbHeight} / 2 + ${trackHeight} / 2))`,
}
const hoverFocusTrack = {
  background: trackHoverColor,
}

const hoverFocus = {
  outline: 0,

  '&::-webkit-slider-thumb': hoverFocusThumb,
  '&::-moz-range-thumb': hoverFocusThumb,
  '&::-ms-thumb': hoverFocusThumb,

  '&::-webkit-slider-runnable-track': hoverFocusTrack,
  '&::-ms-fill-lower': hoverFocusTrack,
  '&::-ms-fill-upper': hoverFocusTrack,
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

class Slider extends React.Component {
  state = {}

  static defaultProps = {
    value: 0,
  }

  handleBlur = e => {
    this.hideInput()

    const event = this.computeInputEvent(e)
    this.handleChange(event)
  }

  handleChange = e => {
    const { onChange } = this.props
    if (onChange) onChange(e)
  }

  handleInputKeyDown = e => {
    switch (keyboardKey.getCode(e)) {
      case keyboardKey.Enter: {
        this.hideInput()

        e.nativeEvent.stopImmediatePropagation()
        e.stopPropagation()
        e.preventDefault()

        const event = this.computeInputEvent(e)
        this.handleChange(event)
        break
      }

      case keyboardKey.Escape: {
        this.hideInput()
        break
      }

      case keyboardKey.Tab: {
        this.hideInput()
        break
      }
    }
  }

  handleInputRef = ref => {
    if (!ref) return
    this.inputRef = ref
    this.inputRef.focus()
    this.inputRef.select()
  }

  handleRangeRef = ref => {
    if (!ref) return
    this.rangeRef = ref
  }

  isValidNumberKey = e => {
    return _.includes(keyboardKey.getCode(e), [
      keyboardKey.Digit0,
      keyboardKey.Digit1,
      keyboardKey.Digit2,
      keyboardKey.Digit3,
      keyboardKey.Digit4,
      keyboardKey.Digit5,
      keyboardKey.Digit6,
      keyboardKey.Digit7,
      keyboardKey.Digit8,
      keyboardKey.Digit9,
      keyboardKey.Decimal,
      keyboardKey.Enter,
    ])
  }

  handleSliderKeyDown = e => {
    if (this.isValidNumberKey(e)) {
      this.handleChange(e)
      this.showInput()
    }
  }

  showInput = () => this.setState(() => ({ showInput: true }))

  focusRange = () => {
    if (!this.rangeRef) return

    this.rangeRef.focus()
  }

  hideInput = () => {
    this.setState(() => ({ showInput: false }), this.focusRange)
  }

  computeInputValue = () => {
    const { unit, value } = this.props

    return unit === 'percent' ? (value * 100).toFixed(3) : value
  }

  computeInputEvent = e => {
    const { unit } = this.props
    const event = { ...e }

    event.target.value = unit === 'percent' ? (e.target.value / 100).toFixed(6) : e.target.value

    return event
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
            onBlur={this.handleBlur}
            onKeyDown={this.handleInputKeyDown}
            defaultValue={this.computeInputValue()}
            className={styles.input}
          />
        ) : (
          <div onClick={this.showInput} className={styles.value}>
            {readout}
          </div>
        )}
        <input
          {...rest}
          ref={this.handleRangeRef}
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
