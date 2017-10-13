// This is used
export const sidePanel = ({ side }) => ({
  position: 'fixed',
  top: 0,
  bottom: 0,
  [side]: 0,
  width: '20em',
  background: '#fff',
  boxShadow: '0 0 2em rgba(0, 0, 0, 0.3)',
})
