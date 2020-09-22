
let projectFolder = require("path").basename("docs");
let sourceFolder = "#src";

let fs = require('fs');

let path = {
    build: {
        html: projectFolder + "/",
        css: projectFolder + "/css/",
        js: projectFolder + "/js/",
        img: projectFolder + "/img/",
        fonts: projectFolder + "/fonts/"
    },

    src: {
        html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
        css: sourceFolder + "/scss/main.scss",
        js: sourceFolder + "/js/*.js",
        img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: sourceFolder + "/fonts/*.ttf"
    },

    watch: {
        html: sourceFolder + "/**/*.html",
        css: sourceFolder + "/**/*.scss",
        js: sourceFolder + "/**/*.js",
        img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },

    clean: "./" + projectFolder + "/"
}

let { src, dest } = require('gulp');
let gulp = require('gulp');
let browsersync = require('browser-sync').create();
let fileinclude = require('gulp-file-include');
let del = require('del');
let scss = require('gulp-sass');
let autoprefixer = require('gulp-autoprefixer');
let groupMedia = require('gulp-group-css-media-queries');
let cleanCss = require('gulp-clean-css');
let rename = require('gulp-rename');
let uglify = require('gulp-uglify-es').default;
let imagemin = require('gulp-imagemin');
let ttf2woff = require('gulp-ttf2woff');
let ttf2woff2 = require('gulp-ttf2woff2');


function browserSync() {
    browsersync.init({
        server: {
            baseDir: "./" + projectFolder + "/"
        },
        port: 3000,
        notify: false
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
                outputStyle: "expanded"
            })
        )
        .pipe(
            groupMedia()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
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
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
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
}

function img() {
    return src(path.src.img)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 // 0 to 7
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fontsStyle() {

    let fileContent = fs.readFileSync(sourceFolder + '/scss/base/_fonts.scss');
    if (fileContent == '') {
        fs.writeFile(sourceFolder + '/scss/base/_fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(sourceFolder + '/scss/base/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

const smartGrid = require('smart-grid');
const options = {
    outputStyle: "scss",
    filename: "_smart-grid",
    columns: 12, // number of grid columns
    offset: "30px", // gutter width - 1.875rem
    mobileFirst: false,
    mixinNames: {
        container: "container"
    },
    container: {
        maxWidth: "1170px",
        fields: "15px" // side fields - 0.9375rem
    },
    breakPoints: {
        xs: {
            width: "370px" // 20rem
        },
        sm: {
            width: "576px" // 36rem
        },
        md: {
            width: "768px" // 48rem
        },
        lg: {
            width: "992px" // 62rem
        },
        xl: {
            width: "1200px" // 75rem
        }
    }
};
function grid(done) {
    smartGrid("./#src/scss/vendor/import/", options);
    done();
};

function cb() { }

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], img);
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

function clean() {
    return del(path.clean);
}

let build = gulp.series(clean, grid, gulp.parallel(html, css, js, img, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;
exports.build = build;
exports.watch = watch;
exports.default = watch;