const Koa = require("koa");
const proxy = require('koa-better-http-proxy');

const app = new Koa();

const proxy_web = proxy("http://localhost:8081",{});



const proxy_list = {
    foo:"http://foo.com",
    bar:"http://bar.com",
    noop:"http://noop.com",
    nothing:"http://nothing.com",
}

const proxy_middle_ls = {};
Object.keys(proxy_list).forEach(key=>{
  proxy_middle_ls[key] = proxy(proxy_list[key],{})
});

app.use((ctx,next)=>{
  let path = ctx.path;
  let subDomain = "";
  if(/^\/([^\/]+)/.test(path)){
      subDomain = RegExp["$1"];
      if(!proxy_list[subDomain]){
        subDomain = "";
      }
  }else{
      subDomain = ""
  }

  ctx.response.set({
    "Access-Control-Allow-Origin":"*"
  });

  if(subDomain){
    path = path.replace("/" + subDomain,"");
    ctx.path = path;
    ctx.request.path = path;
    console.log(path);
    return proxy_middle_ls[subDomain](ctx,next);
  }else{
    return proxy_web(ctx,next);
  }
})


app.listen(8082);
