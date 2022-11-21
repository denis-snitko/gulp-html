const {projectFolder, sourceFolder, smartGridOptions} = require('./config')

const path = {
  build: {
    html: projectFolder + '/',
    css: projectFolder + '/style/',
    js: projectFolder + '/js/',
    img: projectFolder + '/img/',
    fonts: projectFolder + '/fonts/',
  },

  src: {
    html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
    css: sourceFolder + '/scss/*.scss',
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
const cleanCss = require('gulp-clean-css')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify-es').default
const changed = require('gulp-changed')
const tinify = require('gulp-tinify')
const ttf2woff = require('gulp-ttf2woff')
const ttf2woff2 = require('gulp-ttf2woff2')
const webp = require('gulp-webp')
const smartGrid = require('smart-grid')


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
  return src(path.src.css)
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
    .pipe(cleanCss())
    // Раскомментировать, если надо min.css
    // .pipe(
    //   rename({
    //     extname: '.min.css',
    //   }),
    // )
    // .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function img() {
  return (
    src(path.src.img)
      .pipe(changed(path.build.img))
      // Сжатие картинок с помощью сервисв tinyPNG
      // .pipe(tinify('GB8W9Gddw3tr0GRgMK5sX0rt7g2tVkQV'))
      // .pipe(dest(path.build.img))

      // Делаем WEBP
      // .pipe(webp())
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
  )
}

function icons() {
  return src(path.src.icons)
    .pipe(changed(path.build.img + '/icons/'))
    // Делаем WEBP из иконок PNG
    // .pipe(tinify('GB8W9Gddw3tr0GRgMK5sX0rt7g2tVkQV'))
    .pipe(dest(path.build.img + '/icons/'))
    .pipe(browsersync.stream())
}

function svg() {
  return src(path.src.svg).pipe(dest(path.build.img)).pipe(browsersync.stream())
}

function js() {
  return (
    src(path.src.js)
      .pipe(fileinclude())
      .pipe(dest(path.build.js))

      // Если надо сжать JS
      // .pipe(
      //     uglify()
      // )
      // .pipe(
      //     rename({
      //         extname: ".min.js"
      //     })
      // )
      .pipe(dest(path.build.js))
      .pipe(browsersync.stream())
  )
}

function grid(done) {
  smartGrid('./#src/scss/vendors', smartGridOptions)
  done()
}

function fontsWoff() {
  return src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts))
}

function fontsWoff2() {
  return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts))
}

function watchFiles() {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], img)
  gulp.watch([path.watch.icons], icons)
  gulp.watch([path.watch.svg], svg)
}

function clean() {
  return del(path.clean)
}

let build = gulp.series(
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
exports.fontsWoff = fontsWoff
exports.fontsWoff2 = fontsWoff2
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch
