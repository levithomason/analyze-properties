import theme from '../../../ui/styles/theme.js'

const tableStyles = {
  table: props => ({
    marginBottom: '2em',
    width: '100%',
    borderSpacing: 0,
  }),
  tableCell: () => ({
    padding: '1px',
  }),
  tableCellCollapse: () => ({
    width: '1px',
  }),
  tableValueCell: ({ active }) => ({
    padding: '0.5em',
    fontFamily: 'monospace',
    textAlign: 'right',
  }),
  tableRow: ({ active, analysis = {} }) => {
    return Object.assign(
      {
        transition: 'background 0.3s, box-shadow 0.3s, transform 0.3s',
      },
      !analysis.favorite && {
        color: theme.textColors.gray.hex(),
        filter: 'grayscale() brightness(1.1) contrast(0.9)',
      },
      !active && {
        transform: 'scale3d(0.98, 0.98, 0.98)',
        cursor: 'pointer',
        onHover: {
          background: 'rgba(0, 0, 0, 0.03)',
        },
      },
      active && {
        transform: 'scale3d(1, 1, 1)',
        boxShadow: [
          '0 0 2em rgba(0, 0, 0, 0.2)',
          `inset 0 0 0 1px ${theme.colors.blue.fade(0.5).rgb()}`,
        ].join(),
      },
    )
  },
  headerCell: props => ({
    padding: '1em 0.5em',
    textAlign: 'right',
    cursor: 'pointer',
    color: theme.textColors.gray.hex(),
    borderBottom: `1px solid ${theme.grayscale.lighterGray.hex()}`,
    onHover: {
      color: theme.textColors.black.hex(),
    },
  }),
}

export default tableStyles
