const projectFolder = require('path').basename('docs')
const sourceFolder = '#src'

// Smartgrid options
const options = {
  outputStyle: 'scss',
  filename: '_smart-grid',
  columns: 12, // number of grid columns
  offset: '30px', // gutter width - 1.875rem
  mobileFirst: false,
  mixinNames: {
    container: 'container',
  },
  container: {
    maxWidth: '1170px',
    fields: '15px', // side fields - 0.9375rem
  },
  breakPoints: {
    xs: {
      width: '360px', // 20rem
    },
    sm: {
      width: '576px', // 36rem
    },
    md: {
      width: '768px', // 48rem
    },
    lg: {
      width: '992px', // 62rem
    },
    xl: {
      width: '1200px', // 75rem
    },
  },
}

const path = {
  build: {
    html: projectFolder + '/',
    css: projectFolder + '/css/',
    js: projectFolder + '/js/',
    img: projectFolder + '/img/',
    fonts: projectFolder + '/fonts/',
  },

  src: {
    html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
    css: sourceFolder + '/scss/main.scss',
    js: sourceFolder + '/js/*.js',
    img: [
      sourceFolder + '/img/**/*.{jpg,png,gif,ico,webp}',
      '!' + sourceFolder + '/img/icons/*.*',
    ],
    icons: sourceFolder + '/img/icons/*.*',
    svg: sourceFolder + '/img/**/*.svg',
    fonts: sourceFolder + '/fonts/*.ttf',
  },

  watch: {
    html: sourceFolder + '/**/*.html',
    css: sourceFolder + '/**/*.scss',
    js: sourceFolder + '/**/*.js',
    img: sourceFolder + '/img/**/*.{jpg,png,gif,ico,webp}',
    icons: sourceFolder + '/img/icons/*.*',
    svg: sourceFolder + '/img/**/*.svg',
  },

  clean: './' + projectFolder + '/',
}

const { src, dest } = require('gulp')
const gulp = require('gulp')
const browsersync = require('browser-sync').create()
const fileinclude = require('gulp-file-include')
const del = require('del')
const scss = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const groupMedia = require('gulp-group-css-media-queries')
// const cleanCss = require('gulp-clean-css')
// const rename = require('gulp-rename')
// const uglify = require('gulp-uglify-es').default
// const imagemin = require('gulp-imagemin')
const changed = require('gulp-changed')
const tinify = require('gulp-tinify')
const ttf2woff = require('gulp-ttf2woff')
const ttf2woff2 = require('gulp-ttf2woff2')
const webp = require('gulp-webp')
const smartGrid = require('smart-grid')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './' + projectFolder + '/',
    },
    port: 3000,
    notify: false,
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
  return (
    src(path.src.css)
      .pipe(
        scss({
          outputStyle: 'expanded',
        }),
      )
      .pipe(groupMedia())
      .pipe(
        autoprefixer({
          overrideBrowserslist: ['last 5 versions'],
          cascade: true,
        }),
      )
      .pipe(dest(path.build.css))
      // .pipe(cleanCss())
      // .pipe(
      //     rename({
      //         extname: ".min.css"
      //     })
      // )
      // .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
  )
}

function img() {
  return (
    src(path.src.img)
      // .pipe(
      //   imagemin({
      //     // progressive: true,
      //     // interlaced: true,
      //     optimizationLevel: 7, // 0 to 7
      //   }),
      // )
      .pipe(changed(path.build.img))
      .pipe(tinify('GB8W9Gddw3tr0GRgMK5sX0rt7g2tVkQV'))
      .pipe(dest(path.build.img))

      .pipe(webp())
      .pipe(dest(path.build.img))

      .pipe(browsersync.stream())
  )
}

function icons() {
  return src(path.src.icons)
    .pipe(changed(path.build.img + '/icons/'))
    .pipe(tinify('GB8W9Gddw3tr0GRgMK5sX0rt7g2tVkQV'))
    .pipe(dest(path.build.img + '/icons/'))
    .pipe(browsersync.stream())
}

function svg() {
  return src(path.src.svg).pipe(dest(path.build.img)).pipe(browsersync.stream())
}

// function js() {
//   return (
//     src(path.src.js)
//       .pipe(fileinclude())
//       .pipe(dest(path.build.js))
// .pipe(
//     uglify()
// )
// .pipe(
//     rename({
//         extname: ".min.js"
//     })
// )
//       .pipe(dest(path.build.js))
//       .pipe(browsersync.stream())
//   )
// }

function js() {
  return src(path.src.js)
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(gulp.dest(path.build.js))
    .pipe(browsersync.stream())
}

function grid(done) {
  smartGrid('./#src/scss/vendor/import/', options)
  done()
}

function watchFiles() {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], img)
  gulp.watch([path.watch.icons], icons)
  gulp.watch([path.watch.svg], svg)
}

function fonts() {
  src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts))
  return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts))
}

function clean() {
  return del(path.clean)
}

let build = gulp.series(
  clean,
  fonts,
  grid,
  gulp.parallel(html, css, js, img, icons, svg),
)

let watch = gulp.parallel(build, watchFiles, browserSync)

exports.html = html
exports.css = css
exports.js = js
exports.img = img
exports.icons = icons
exports.svg = svg
exports.fonts = fonts
exports.build = build
exports.watch = watch
exports.default = watch
