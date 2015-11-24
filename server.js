"use strict"
require("colors")

const path          = require("path")

const express       = require("express")
const _             = require("lodash")

let app = express()
app.use(express.static(path.join(__dirname, "dist")))
app.use(require("body-parser").json())

let dags = require("./dags")

app.get("/api/dags", (req, res, next) => {
    if (dags)
        return res.json(dags.store)

    return next(new Error("No dags"))
})

app.post("/api/dags", (req, res, next) => {
    let dag = _.pick(req.body, ["name", "breed"])

    if (!dag) return next(new Error("Bad request - no body"))
    if (!dag.name) return next(new Error("Bad Request - please name the dag"))
    if (!dag.breed) return next(new Error("Bad Request - what kinna dag it is?"))

    dag.dag_id = ++dags.length
    dags.store.push(dag)
    return res.json(dag)
})

app.use((err, req, res, next) => {
    console.log(err)
})

let port = process.env.PORT || 3000

app.listen(port, () => console.log(`Listening on ${port}`.green))
