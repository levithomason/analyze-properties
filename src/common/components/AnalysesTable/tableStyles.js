const tableStyles = {
  table: props => ({
    marginBottom: '2em',
    width: '100%',
    // fontSize: '12px',
    borderSpacing: 0,
  }),
  tableCell: props => ({
    padding: '0.5em',
    borderBottom: '1px solid #eee',
    fontFamily: 'monospace',
  }),
  tableRow: ({ active }) => ({
    background: active ? 'rgba(0, 0, 0, 0.075)' : '',
    cursor: 'pointer',
    onHover: {
      background: 'rgba(0, 0, 0, 0.05)',
    },
  }),
  headerCell: props => ({
    padding: '0.125em 0.5em',
    textAlign: 'left',
    borderBottom: '1px solid #ccc',
  }),
}

export default tableStyles
