<template>
    <div>
          <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
            </el-alert>
            <!-- steps进度条 -->
            <!-- 共用activeIndex使得进度条和下面的tabs联动 这里active接收index0 1 2，所以将index-0将字符串转为数字-->
            <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 因为数字最终需要把每个tab合到一起，使用form组件 -->
     <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
            <!-- v-modal中对应name的'0' '1' -->
             <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="BeforeTabLeave"  @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                     <el-form-item label="商品价格" prop="goods_price" >
                        <el-input v-model="addForm.goods_price" type="number"></el-input>
                    </el-form-item>
                     <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight" type="number"></el-input>
                    </el-form-item>
                     <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                         <el-cascader v-model="addForm.goods_cat"  :options="catelist"  :props="cateProps"
                          @change="handleChange"></el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <!-- 渲染表单的item项 -->
                    <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
                        <!-- 复选框组 -->
                         <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border :label="cb" v-for="(cb,i) in item.attr_vals" :key="i"></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <!-- action上传图片的后台api地址,使用绝对路径  n-preview预览事件-->
                    <el-upload :headers="headerObj" :action="uploadURL"  :on-preview="handlePreview"
                  :on-remove="handleRemove" list-type="picture" :on-success="handleSuccess">
                    <el-button size="small" type="primary" >点击上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <!-- 。富文本编辑器 -->
                    <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                    <el-button type="primary" class="bunAdd" @click="add">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
     </el-form>
        </el-card>
        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img :src="previewUrl" alt="" class="preViewImg">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    data(){
        return {
            activeIndex:'0',
            // 添加商品
            addForm:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                // 商品所属分类数组
                goods_cat:[],
                pics:[],
                // 商品详情描述
                goods_introduce:'',
                attrs:[]
            },
            addFormRules:{
                goods_name:[
                    { required:true, message:'请输入商品名称', trigger:'blur'}
                ],
                goods_price:[
                    { required:true, message:'请输入商品价格', trigger:'blur'}
                ],
                 goods_weight:[
                    { required:true, message:'请输入商品重量', trigger:'blur'}
                ],
                goods_number:[
                    { required:true, message:'请输入商品数量', trigger:'blur'}
                ],
                goods_cat:[
                    { required:true, message:'请选择商品分类', trigger:'blur'}
                    
                ]
            },
            // 商品分类列表
            catelist:[],
            cateProps:{
                label:'cat_name',
                value:'cat_id',
                children:'children',
                 expandTrigger: 'hover'
            },
            // 动态参数列表
            manyTabData:[],
            // 静态属性
            onlyTabData:[],
            // 上传图片的url
            uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传组件的headers请求头对象
            headerObj:{
              Authorization: window.sessionStorage.getItem('token')
            },
            previewUrl:'',
            previewVisible:false
        }
    },
    created(){
        this.getCateList();
    },
    methods:{
        // 获取所有商品分类数据
        async getCateList(){
            const {data:res}=await this.$http.get('/categories');
            if(res.meta.status!==200) return this.$message.error('获取商品分类列表失败');
            this.catelist=res.data;
        },
        // 分类选择触发 该表了goods_cat
        handleChange(){
            console.log(this.addForm.goods_cat)
        },
        // 在切换tab页之前触发，要确保选择了分类 avctivename为对应的name值 阻止切换
        BeforeTabLeave(activeaName,oldActiveName){
            if(this.addForm.goods_cat.length!==3 && oldActiveName==='0'){
                // 没有选择分类要阻止
                this.$message.error('请先选择商品分类');
                return false;
            }
        },
        async tabClicked(){
            if(this.activeIndex==='1'){
                // 访问的是动态参数面板
                const {data:res}=await this.$http.get(`/categories/${this.cateId}/attributes`,{
                    params:{sel:'many'}
                });
                if(res.meta.status!==200) return this.$message.error('获取动态参数列表失败!');
                // 成功后将数据以tags渲染出来
                res.data.forEach((item)=>{
                    // 把参数字符串转为数组
                   item.attr_vals=item.attr_vals.lenght===0 ?[]:item.attr_vals.split(' ');
                })
                this.manyTabData=res.data;
                
            }else if(this.activeIndex=='2'){
                // 访问静态属性
                  const {data:res}=await this.$http.get(`/categories/${this.cateId}/attributes`,{
                    params:{sel:'only'}
                });
                if(res.meta.status!==200) return this.$message.error('获取静态属性列表失败!');
                // 渲染静态属性
              
                this.onlyTabData=res.data;
            }
        },
    // 处理图片预览效果
        handlePreview(file){
            this.previewUrl=file.response.data.url;
            this.previewVisible=true;
        },
        // 图片上传成功触发 response是服务器响应的数据，将临时路径存入addForm中
        handleSuccess(response){
            // 1.拼接图片信息对象
            const picInfo ={pic :response.data.temp_path}
            // 2.将对象存入pics
            this.addForm.pics.push(picInfo);
        },
    // 处理移除的事件 file为要被移除的对象
        handleRemove(file){
            
            //  获取临时路径 找到pics中对应索引 删除pics对应项
            const filePath=file.response.data.temp_path;
            const index=this.addForm.pics.findIndex((x)=>{
                return x.pic==filePath;
            });
            this.addForm.pics.splice(index,1);
        },
        add(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return this.$message.error('请填写必要的表单项');
                // 执行添加 因为goods_cat要以字符串形式添加，但是再级联中使用数组，不可以直接改变数据类型，
                // 所以使用深拷贝，相同但结构独立进行操作 安装依赖lodash cloneDeep(obj) 操作新对象
               const form= _.cloneDeep(this.addForm);
               form.goods_cat=form.goods_cat.join(',');
            //    处理动态参数和静态属性
            this.manyTabData.forEach(item=>{
                const newInfo ={
                    attr_id:item.attr_id,
                    attr_value:item.attr_vals.join(' ')
                }
                this.addForm.attrs.push(newInfo);
            });
             this.onlyTabData.forEach(item=>{
                const newInfo ={
                    attr_id:item.attr_id,
                    attr_value:item.attr_vals
                }
                this.addForm.attrs.push(newInfo);
            });
            form.attrs=this.addForm.attrs;
            // 发起请求 商品名称必须唯一
                const {data:res} =await this.$http.post(`/goods`,form);
                if(res.meta.status!==201) return this.$message.error('添加商品失败');
                this.$message.success('添加成功');
                // 跳转页面
                this.$router.push('/goods');
            })
        }
    },
    computed:{
        cateId(){
            if(this.addForm.goods_cat.length==3){
                return this.addForm.goods_cat[2]
            }
            return null;
        }
    }
}
</script>

<style lang="less" scoped>
.el-checkbox {
    margin:0 10px 0 0 !important;
}
.preViewImg {
    width: 100%;
}
.bunAdd {
    margin-top: 15px;
}
</style>