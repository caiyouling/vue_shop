<template>
    <div>
           <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
             <el-alert title="注意：只允许为第三级分类进行设置相关参数" show-icon :closable="false" type="warning"> </el-alert>
        <!-- 选择商品分类 -->
        <el-row class="cat_opt">
            <el-col>
                <span>选择商品分类：</span>
                <el-cascader v-model="selectedCateKeys" :options="cateList"  :props="cateProps"
                     @change="handleChange"></el-cascader>
            </el-col>
        </el-row>
        <!-- tab页签 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isDisable" @click="addDialogVisible=true">添加参数</el-button>
            <!-- 动态参数 -->
            <el-table :data="manyTabData" stripe border>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                        <!--添加的标签 -->
                        <el-input class="input-new-tag" v-if="scope.row.inputVisible"  v-model="scope.row.inputValue"  ref="saveTagInput"
                      size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"  @click="removeParams(scope.row.attr_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">           
             <el-button type="primary" size="mini" :disabled="isDisable" @click="addDialogVisible=true">添加属性</el-button>
                 <el-table :data="onlyTabData" stripe border>
                  <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                        <!--添加的标签 -->
                        <el-input class="input-new-tag" v-if="scope.row.inputVisible"  v-model="scope.row.inputValue"  ref="saveTagInput"
                      size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            
        </el-tab-pane>
    </el-tabs>
        </el-card>
        <el-dialog :title="'添加'+titleText"  :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 修改参数 -->
         <el-dialog :title="'添加'+titleText"  :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
            // 分类列表
            cateList:[],
            // 级联配置对象
            cateProps:{
                 expandTrigger: 'hover' ,
                 label:'cat_name',
                 value:'cat_id',
                 children:'children'
            },
            // 级联选择框选择的数组
            selectedCateKeys:[],
            // 被激活的页签名称
            activeName:'many',
            // 动态属性数据
            manyTabData:[],
            onlyTabData:[],
            // 添加对话框
            addDialogVisible:false,
            // 添加参数
            addForm:{
                attr_name:''
            },
            addFormRules:{
                // 验证规则
                attr_name:[
                    {required:true,message:'请输入参数名称',trigger:'blur'}
                ]
            },
            editDialogVisible:false,
            editForm:{},
            // 修改表单的规则
            editFormRules:{
                // 验证规则
                attr_name:[
                    {required:true,message:'请输入参数名称',trigger:'blur'}
                ]
            },
            // 控制按钮与文本框
            inputVisible:false,
            inputValue:''
        }
    },
    created(){
        // 获取所有商品分类
        this.getCateList()
    },
    methods:{
        async getCateList(){
            const {data:res}=await this.$http.get('/categories');
            if(res.meta.status!==200) return this.$message.error('获取分类列表失败！');
            this.cateList=res.data;
        },
        // 级联选择框发生变化触发
        async handleChange(){
            this.getParamsData();
       },
        // tab点击
        handleTabClick(){
            this.getParamsData();
        },
        // 获取参数列表数据
        async getParamsData(){
             // 选中不是三级分类
            if(this.selectedCateKeys.length!==3) {
                this.selectedCateKeys=[];
                this.manyTabData=[];
                this.onlyTabData=[];
                return ;
            }
        //   获取三级分类下的参数
        const {data:res}=await this.$http.get(`/categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
        if(res.meta.status!==200) return this.$message.error('获取参数列表失败！');
        console.log(res.data);
        res.data.forEach(item=>{
            // 把逗号相隔的字符替换为空格再转为数组
            item.attr_vals=item.attr_vals.replace(/\,/g,' ');
            item.attr_vals=item.attr_vals?item.attr_vals.split(' '):[];
            // 控制文本框显示隐藏
            // 显示
            item.inputVisible=false;
            // 数据
            item.inputValue=''
        });
        // 判断数据属于哪个表格
        if(this.activeName=='many'){
            this.manyTabData=res.data
        }else{
            this.onlyTabData=res.data
        }
        },
        // 添加对话框关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields();
        },
        addParams(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return;
                const {data:res}=await this.$http.post(`/categories/${this.cateId}/attributes`,{
                    attr_name:this.addForm.attr_name,
                    attr_sel:this.activeName
                });
                if(res.meta.status!==201) return this.$message.error('添加属性失败');
                this.$message.success('添加参数成功');
                this.addDialogVisible=false;
                this.getParamsData();
            })
        },
        async showEditDialog(attr_id){
            const {data:res}=await this.$http.get(`/categories/${this.cateId}/attributes/${attr_id}`,{
                params:{attr_sel:this.activeName}
            }); 
            if(res.meta.status!==200) return this.$message.error('获取参数信息失败');
            this.editForm=res.data;
            this.editDialogVisible=true;
        },
        // 重置修改表单
        editDialogClosed(){
            this.$refs.editFormRef.resetFields();
        },
        // 修改参数
        editParams(){
            this.$refs.editFormRef.validate(async valid=>{
                if(!valid) return;
                const {data:res}=await this.$http.put(`/categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                    attr_name:this.editForm.attr_name,
                    attr_sel:this.activeName
                });
                if(res.meta.status!==200) return this.$message.error('修改参数失败');
                this.$message.success('修改参数成功');
                this.getParamsData();
                this.editDialogVisible=false;
            })
        },
        // 删除参数
        async removeParams(id){
             const confirm =await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
             }).catch(err=>err);
             if(confirm!=='confirm') return this.$message.info('已取消删除');
            const {data:res}=await this.$http.delete(`/categories/${this.cateId}/attributes/${id}`);
            if(res.meta.status!==200) return this.$message.error('删除参数失败！');
            this.$message.success('删除参数成功');
            this.getParamsData();
        },
        // 文本框失去焦点或点击enter会触发
        async handleInputConfirm(row){
            console.log(row);
            if(row.inputValue.trim().length===0){
                row.inputValue=''
                // 失去焦点时回到button状态
                row.inputVisible=false
            }else{
                // 添加新可选参数
                row.attr_vals.push(row.inputValue.trim());
                row.inputValue='';
                row.inputVisible=false;
                // 发起请求保存这次操作
               this.saveAttrVals(row);
            } 
        },
        // 将对attr_vals操作保存到数据库
        async saveAttrVals(row){
             const {data:res}=await this.$http.put(`/categories/${this.cateId}/attributes/${row.attr_id}`,{
                    attr_name:row.attr_name,
                    attr_sel:this.activeName,
                    attr_vals:row.attr_vals.join(' ')
                });
                if(res.meta.status!==200) return this.$message.error('修改参数项失败');
                this.$message.success('修改参数成功');
                this.getParamsData();
        },
        showInput(row){
            row.inputVisible=true;
            // 让文本框自动获得焦点
            // nextTick作用：当页面上元素被重新渲染之后才会执行回调函数的代码 因为需要先把button转换渲染出input，页面才能找到input--异步
         this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
        },
        handleClose(i,row){
            row.attr_vals.splice(i,1);
            this.saveAttrVals(row);
        }
    },
    computed:{
        // 如果按钮需要被禁用返回true
        isDisable(){
            if(this.selectedCateKeys.length!==3) return true;
            return false;
        },
        cateId(){
            if(this.selectedCateKeys.length===3) return this.selectedCateKeys[2];
            return null;
        },
        // 动态计算标题文本
        titleText(){
            if(this.activeName=='many') return '动态参数';
            return '静态属性'
        }
    }
}
</script>

<style lang="less" scoped>
 .cat_opt {
     margin: 10px;
 }
 .el-tag {
     margin:10px;
 }
 .input-new-tag {
     width:120px;
 }
</style>