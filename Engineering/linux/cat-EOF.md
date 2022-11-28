# 【Linux基础】cat > file 和 EOF 快速编辑文本

## cat
`cat` 命令用于连接文件并打印到标准输出设备上
`>`在linux意味着重定向，`>>`代表追加内容而不是覆盖内容

`cat > file`用于创建文件并将标准输入设备上的内容输出重定向到fie文件中去

## EOF
`EOF` 是 `End Of File`的缩写，表示自定义终止符，用法是`>> EOF`

但它只是一个标识，不是固定的，看个例子
```sh
cat << EOF > file
> abc
> def
> EOF
```

```sh
cat << HELLO > file
> abc
> def
> HELLO
```

以上两段操作结果是一样的，在第二个例子，`<< HELLO` 替代了 `<< EOF`的功能

另外，在linux中按`ctrl + d` 也代表着 `EOF`

## 综合运用
* `>`输出重定向
* `>>`用来追加内容而不思覆盖
* `<< EOF`和`> file`的位置不固定，可以交换

那么就可以衍生出以下几种写法
```sh
# 覆盖file内容
cat > file << EOF
cat << EOF > file

# 追加内容到file文件
cat >> file << EOF
car << EOF >> file
```
