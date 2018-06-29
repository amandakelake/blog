import React, { PropTypes, Component } from 'react'

let instances = [];
// componentWillMount的时候把该组件推进数组
const register = (componnet) => instances.push(componnet);
// componentWillUnmount的时候把该组件移除出数组
const unregister = (component) => instances.splice(instances.indexOf(component), 1) ；

const historyPush = (path) => {
  history.pushState({}, null, path) ；
  // 每次有跳转，都遍历所有的路由对象，然后强制更新
  instances.forEach(component => component.forceUpdate());
}
const historyReplace = (path) => {
  history.replaceState({}, null, path);
  instances.forEach(component => component.forceUpdate());
}

const matchPatch = (pathname, options) => {
  // exact默认为false
  const { exact = false, path } = options
  if (!path) {
    return {
      path: null,
      url: pathname,
      isExact: true,
    }
  }
  // 正则匹配  是否完全匹配
  const match = new RegExp(`^${path}`).exec(pathname)
  if (!match) {
    // 没有匹配上
    return null
  }
  const url = match[0]
  const isExact = pathname === url
  if (exact && !isExact) {
    // 匹配上了，但是不是精确匹配
    return null
  }
  return {
    path,
    url,
    isExact,
  }
}

class Route extends Component {
  static propTypes = {
    exact: PropTypes.bool,
    path: PropTypes.string,
    component: PropTypes.func, // 组件返回UI  所以是func
    render: PropTypes.func,
  }

  componentWillMount() {
    addEventListener('popstate', this.handlePop);
    register(this);
  }

  componentWillUnmount() {
    unregister(this);
    removeEventListener('popstate', this.handlePop);
  }

  handlePop() {
    this.forceUpdate();
  }

  render() {
    const { path, exact, component, render } = this.props;
    // window.location是全局变量，location可以直接拿到
    const match = matchPath(location.pathname, { path, exact });
    // 如果没有匹配上 path 属性，return null
    if (!match) return null;
    // 匹配上path属性，并且有component属性 直接创建新元素， 通过match传递过去
    if (component) return React.createElement(component, { match });
    // 匹配上path属性，没有component属性，检查render属性
    if (render) return render({ match });
    // 全都没有匹配上，只好null了
    return null;
  }
}

class Link extends Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
    replace: PropTypes.bool,
  }

  handleClick = (event) => {
    const { to, replace } = this.props;
    // 阻止a标签的默认事件，无法正常跳转
    event.preventDefault();
    // 路由逻辑
    replace ? historyReplace(to) : historyPush(to)
  }

  render() {
    const { to, replace } = this.props;
    return (
      <a href={to} onClick={this.handleClick}>
        {children}
      </a>
    );
  }
}

class Redirect extends Component {
  static defaultProps = {
    push: false
  }
  static propTypes = {
    to: PropTypes.string.isRequired,
    push: PropTypes.bool.isRequired,
  }
  componentDidMount() {
    const { to, push } = this.props
    push ? historyPush(to) : historyReplace(to)
  }
  render() {
    return null
  }
}