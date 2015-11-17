/* jshint laxcomma: true */

"use strict";

require("colors");
const gulp                = require("gulp")
    , gChmod              = require("gulp-chmod")
    , gWeb                = require("gulp-connect")
    , gIf                 = require("gulp-if")

const gPostCSS            = require("gulp-postcss")
    , postImport          = require("postcss-import")
    , htmlPrefixer        = require("gulp-html-autoprefixer")
    , autoPrefixer        = require("gulp-autoprefixer")

const config = {
    permissionBits: 664,
    autoprefix: process.env.PREFIX === "true" ? true : false,

    /**
     * Check out the docs for the postcss-import processor
     * https://github.com/postcss/postcss-import#usage
     */
    importCSS: process.env.IMPORT_CSS === "true" ? true : false,

    server: {
        reload: process.env.RELOAD === "false" ? false : true,
        port: process.env.PORT || 3000
    }
}

const paths = {
    src: { // src files if working with transcompiled stuff
        root    : "src/**/*",
        html    : "src/**/*.html",
        app     : "src/app/**/*",
        layout  : "src/index.html",
        css     : "src/css/**/*.css",
        cssMain : "src/css/main.css"
    },

    vendor: { // vendors stuff/lib/dependencies
        js: ["vendor/js/**/*.js", "node_modules/cognition-framework/dist/cognition.js", "node_modules/catbus/src/catbus.js"],
        css: ["vendor/css/**/*.css"]
    },

    dest: { // output dirs
        root: "dist",
        css: "dist/css",
        js: "dist/js",
        vendor: {
            js: "dist/js/vendor",
            css: "dist/css/vendor"
        }
    }
}

const webServerConfig = {
    port: config.server.port,
    livereload: config.server.reload,
    root: paths.dest.root
}

const autoprefixConfig = {
    browsers: ["IE 8", "IE 11", "last 3 versions"],
    add: true,
    remove: true,
    cascade: true
}

const tasks = ["vendorJs", "vendorCss", "appFiles", "serve", "watch"]

gulp.task("default", tasks);

gulp.task("appFiles", function () {
    const htmlPref = htmlPrefixer(autoprefixConfig)
        , autoPref = autoPrefixer(autoprefixConfig)

    gulp.src(paths.src.html)
        .pipe(gIf(config.autoprefix, htmlPref)) // conditionally do autoprefixing of inline css in html files
        .pipe(gulp.dest(paths.dest.root));

    /**
     * if you're using @import directives to modularize your css, do this via
     * the IMPORT_CSS env flag see the above comment in the cofig object for
     * notes on using @import directives
     */
    if (config.importCSS) {
        gulp.src(paths.src.cssMain)
            .pipe(gPostCSS([ postImport() ]))
            .pipe(gIf(config.autoprefix, autoPref)) // still conditionally using the prefixer
            .pipe(gulp.dest(paths.dest.css))

    /**
     * if !importCSS, the build process will consuming all css files
     * individually and write them out to the dist/css folder individually
     */
    } else {
        gulp.src(paths.src.css)
            .pipe(gIf(config.autoprefix, autoPref))
            .pipe(gulp.dest(paths.dest.css))
    }
})

if (config.server.reload) {
    gulp.task("reload", function () {
        gulp.src(paths.dest.root)
            .pipe(gWeb.reload())
    })
}

gulp.task("watch",  function () {
    gulp.watch(paths.vendor.js,     ["vendorJs"]);
    gulp.watch(paths.vendor.css,    ["vendorCss"]);
    gulp.watch(paths.src.html,      ["appFiles"])
    gulp.watch(paths.src.css,       ["appFiles"])

    if (config.server.reload) {
        gulp.watch(paths.dest.root, ["reload"])
    }


})

/*
 * This task kicks off the webserver. Change the options above to
 * alter its behavior.
 */
gulp.task("serve", function () {
    gWeb.server(webServerConfig);
});

/*
 * Both vendor tasks just watch the ./vendor dir for new vendor js
 * and css, copying them over when added or updated.
 */
gulp.task("vendorJs", function () {
    gulp.src(paths.vendor.js)
        .pipe(gChmod(config.permissionBits))
        .pipe(gulp.dest(paths.dest.vendor.js));
});

gulp.task("vendorCss", function () {
    gulp.src(paths.vendor.css)
        .pipe(gChmod(config.permissionBits))
        .pipe(gulp.dest(paths.dest.vendor.css));
});
