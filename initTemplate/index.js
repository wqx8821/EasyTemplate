#!/usr/bin/env node

console.log('您正在创建项目,可通过 & 符号拼接批量创建（批量时不要选择utils方法）')
const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const stat = fs.stat

// 配置项
const config = {
	// 初始化模板项目 主要用于多入口项目时
	initAddress: '../../', // 目标初始化路径 src
	routerAddress: '../../view', // 目标路由组件路径 src/view
	targetInit: './template/init/', // 初始化模板路径
	targetRouter: './template/routerView/', // 路由模板路径
	targetRouterTS: './template/routerViewTS/', // 路由TS模板路径
	targetReact: './template/reactView/', // reactPage模板路径
	targetUtils: './template/utilFunction/' // 常用工具方法
}

// 模板路径
const targetDirInit = path.resolve(__dirname, config.targetInit)
const targetDirRouter = path.resolve(__dirname, config.targetRouter)
const targetDirRouterTS = path.resolve(__dirname, config.targetRouterTS)
const targetDirReact = path.resolve(__dirname, config.targetReact)
const targetDirUtils = path.resolve(__dirname, config.targetUtils)

// 询问用户配置项
const question = [
	{
		type: 'input',
		name: 'name',
		message: '请输入项目名称：'
	},
	{
		type: 'list', // 交互类型 -- 单选（无序）
		message: '请选择创建类型', // 引导词
		name: 'template', // 自定义的字段名
		choices: ['路由模板', '路由模板-TS版', '初始模板', 'reactPage模板', '常用封装方法'] // 选项列表
	}
]

// 拷贝文件方法
const copyFile = (targetDir, resultDir) => {
	// 读取文件、目录
	fs.readdir(targetDir, function (err, paths) {
		if (err) {
			throw err
		}
		paths.forEach(function (p) {
			const target = path.join(targetDir, '/', p)
			const res = path.join(resultDir, '/', p)
			let read
			let write
			stat(target, function (err, statsDta) {
				if (err) {
					throw err
				}
				if (statsDta.isFile()) {
					read = fs.createReadStream(target)
					write = fs.createWriteStream(res)
					read.pipe(write)
				} else if (statsDta.isDirectory()) {
					fs.mkdir(res, function () {
						copyFile(target, res)
					})
				}
			})
		})
	})
}

// 根据选择的模板进行不同的 操作
const templateSelect = (template, resultDir) => {
	// 判断使用那个模板
	switch (template) {
		case '初始模板':
			copyFile(targetDirInit, resultDir)
			break
		case '路由模板':
			copyFile(targetDirRouter, resultDir)
			break
		case '路由模板-TS版':
			copyFile(targetDirRouterTS, resultDir)
			break
		case 'reactPage模板':
			copyFile(targetDirReact, resultDir)
			break
		case '常用封装方法':
			copyFile(targetDirUtils, resultDir)
			break
	}
}

// 批量创建名称 处理
const division = name => {
	name = name.trim()
	if (!name) {
		console.log('项目目录不能为空')
		// 如果输入空，继续询问
		createProject()
		return false
	} else {
		let temp = name.split('&')
		return [...new Set(temp)]
	}
}

// 主程序
const createProject = () => {
	// 询问用户问题
	inquirer
		.prompt(question)
		.then(({ name, template }) => {
			let nameArr = division(name)
			if (!nameArr) return false

			// 当选择的未路由组件时 检查view目录是否存在 不存在则先创建
			if (template.includes('路由')) {
				let pathDir = path.resolve(__dirname, config.routerAddress)
				fs.access(pathDir, function (err) {
					if (err) {
						fs.mkdir(pathDir, function (err) {
							if (err) throw err
						})
					}
				})
			}

			// 批量创建
			nameArr.forEach(item => {
				if (item.trim()) {
					// 目标路径
					const resultDir = !template.includes('路由')
						? path.resolve(__dirname, config.initAddress, item)
						: path.resolve(__dirname, config.routerAddress, item)

					// fs.access()方法用于测试文件是否存在
					fs.access(resultDir, function (err) {
						if (err) {
							fs.mkdir(resultDir, function (err) {
								if (err) throw err
								// 判断使用那个模板
								templateSelect(template, resultDir)
							})
						} else {
							console.log(`${item} 模板目录已存在，请输入其他名称`)
							// 不存在，继续询问
							createProject()
						}
					})
				}
			})
		})
		.catch(err => {
			console.log(err)
		})
}

createProject()
