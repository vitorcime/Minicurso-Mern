const express = require('express');
const router = express.Router();
const Todo = require("../models/todo")
const Joi = require("joi")
const passport = require('passport')
Joi.objectId = require("joi-objectid")(Joi)
const validator = require('express-joi-validation')({})

const bodyValidator = Joi.object({
    listName: Joi.string().required(),
    desc: Joi.string().allow(""),
    todos: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        desc: Joi.string().allow(""),
        checked: Joi.boolean().required()
    }))
})

const paramsValidator = Joi.object({
    id: Joi.objectId().required()
})

// passport.authenticate := um MW que exige o token de autenticação
router.get('/todo/:id', passport.authenticate('jwt', { session: false }), validator.params(paramsValidator), function (req, res) {
    Todo.getTodoById(req.params.id, req.user._id, function (err, todo) {
        if (err) {
            console.log(err)
            return res.status(400).send('server could not understand the request')
        }
        res.status(200).json(todo)
    })
})

router.get('/todos', passport.authenticate('jwt', { session: false }), function (req, res) {
    Todo.getAllTodos(req.user._id, function (err, todos) {
        if (err) {
            console.log(err)
            return res.status(400).send('server could not understand the request')
        }
        res.status(200).json(todos)
    })
})

router.post('/todo', passport.authenticate('jwt', { session: false }), validator.body(bodyValidator), function (req, res) {
    let newTodo = {}
    newTodo.userId = req.user._id
    newTodo.toDo = req.body.toDo
    newTodo.desc = req.body.desc
    newTodo.listName = req.body.listName
    Todo.addTodo(newTodo, function (err, todo) {
        if (err) {
            console.log(err)
            return res.status(400).send('server could not understand the request')
        }
        res.status(201).json(todo)
    })
})

router.put('/todo/:id', passport.authenticate('jwt', { session: false }), validator.params(paramsValidator), validator.body(bodyValidator), function (req, res) {
    let updatedTodo = {}
    updatedTodo._id = req.params.id
    updatedTodo.userId = req.user._id
    updatedTodo.toDo = req.body.toDo
    updatedTodo.listName = req.body.listName
    updatedTodo.desc = req.body.desc
    Todo.updateTodo(updatedTodo, function (err, todo) {
        if (err) {
            console.log(err)
            return res.status(400).send('server could not understand the request')
        }
        res.status(200).json(todo)
    })
})

router.delete('/todo/:id', passport.authenticate('jwt', { session: false }), validator.params(paramsValidator), function (req, res) {
    Todo.deleteTodo(req.params.id, req.user._id, function (err, todo) {
        if (err) {
            console.log(err)
            return res.status(400).send('server could not understand the request')
        }
        res.status(203).send()
    })
})

module.exports = router