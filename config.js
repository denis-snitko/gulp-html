const projectFolder = require('path').basename('docs')
const sourceFolder = '#src'

const smartGridOptions = {
  outputStyle: 'scss',
  filename: '_smart-grid',
  columns: 12, // number of grid columns
  offset: '30px', 
  mobileFirst: false,
  mixinNames: {
    container: 'container',
  },
  container: {
    maxWidth: '1400px',
    fields: '50px', 
  },
  breakPoints: {
    xxs: {
      width: '375px', 
    },
    xs: {
      width: '414px', 
    },
    sm: {
      width: '576px', 
    },
    md: {
      width: '768px', 
    },
    lg: {
      width: '992px', 
    },
    xl: {
      width: '1200px',
    },
    xxl: {
      width: '1400px',
    },
  },
}

module.exports = {
  projectFolder,
  sourceFolder,
  smartGridOptions
}
