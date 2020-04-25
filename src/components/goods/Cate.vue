<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 商品 -->
         <el-card>
             <el-row>
                 <el-col> <el-button type="primary" @click="showAddCateDialog">添加分类</el-button></el-col>
             </el-row>
            <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false"
             :expand-type="false" show-index index-text="#" border :show-row-hover="false"> 
           <!-- 是否有效 -->
            <template slot="isOk" slot-scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
                <i class="el-icon-error" v-else style="color:red"></i>
            </template>
            <!-- 排序 -->
            <template slot="order" slot-scope="scope">
               <el-tag size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
                <el-tag type="success" size="mini" v-else-if="scope.row.cat_level==1">二级</el-tag>
                 <el-tag type="warning" size="mini" v-else>三级</el-tag>
            </template>
            <!-- caoz -->
            <template slot="opt" slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditCateDialog(scope.row)"></el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeCateConfirm(scope.row)"></el-button>
            </template>
            </tree-table>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
             :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
                 layout="total, sizes, prev, pager, next, jumper"  :total="total">
             </el-pagination>
        </el-card>
        <!-- 添加分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
        <el-form ref="addCateFormRef" :rules="addCateFormRules" :model="addCateForm" label-width="100px">
            <el-form-item label="分类名称：" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
             <el-form-item label="父级分类：">
              <!-- 使用级联进行选择 -->
              <!-- options指定数据源 -->
               <el-cascader class="cascader" v-model="selectedKeys"  :options="parentCateList" :props="cascaderProps"
                     @change="parentCateChanged" clearable change-on-select></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 编辑 -->
        <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%">
        <el-form ref="editCateRef" :rules="editCateRules" :model="editCateForm" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="editCateForm.cat_name" ></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="EditCate">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
            // 商品分类的数据列表
            cateList:[],
            queryInfo:{
                // 显示几级
                type:3,
                // 页码
                pagenum:1,
                // 每页显示多少条
                pagesize:5
            },
            // 总数据条数
            total:0,
            // 为table指定列的定义
            columns:[{
                label:'分类名称',
                //接收value
                prop:'cat_name'
            },{
                label:'是否有效',
                // 将当前列定义为模板
                type:'template',
                template:'isOk'
            },{
                label:'排序',
                // 将当前列定义为模板
                type:'template',
                template:'order'
            },{
                label:'操作',
                // 将当前列定义为模板
                type:'template',
                template:'opt'
            }],
            // 添加分类对话框
            addCateDialogVisible:false,
            // 添加分类的表单数据对象
            addCateForm:{
                cat_name:'',
                // 父级分类id
                cat_pid:0,
                // 分类等级
                cat_level:0
            },
            // 添加分类表单的验证规则
            addCateFormRules:{
                cat_name:[
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 父级分类列表
            parentCateList:[],
            // 指定级联选择器的配置对象
            cascaderProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children',
                expandTrigger:'hover'
            },
            // 选中的数据id存到数组中
            selectedKeys:[],
            // 打开编辑分类
            editDialogVisible:false,
            editCateForm:{
                cat_name:'',
                id:0
            },
            editCateRules:{
                cat_name:[
                    {required:true,message:'请输入分类名称',trigger:'blur'}
                ]
            }
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        // 获取商品分类数据
        async getCateList(){
            const {data:res}=await this.$http.get('/categories',{params:this.queryInfo});
            if(res.meta.status!==200) return this.$message.error('获取分类列表失败！');
            // 把数据列表赋值给list
            this.cateList=res.data.result;
            this.total=res.data.total;
        },
        // 监听pagesize改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize;
            this.getCateList();
        },
        // 监听pagenum改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum=newPage;
            this.getCateList();
        },
        // 添加分类
        showAddCateDialog(){
            // 先获取父级分类数据 再展开对话框
            this.getParentCateList();
            this.addCateDialogVisible=true;
        },
        // 获取父级分类的数据列表 因为最多为三级，所以type应该为2
        async getParentCateList(){
            const {data:res}=await this.$http.get('/categories',{params:{"type":2}});
            if(res.meta.status!==200) return this.$message.error('获取父级数据失败！');
            this.parentCateList=res.data;
            
        },
        // 选择项触发
        parentCateChanged(){
            // 监听选择级联 如果被选中大于0 证明选中了父级分类
            if(this.selectedKeys.length>0){
                // 将keys中最后一个id作为新分类的父级id
                this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1];
                this.addCateForm.cat_level=this.selectedKeys.length;
                return 
            }else{
                // 没有选中父级分类，则为一级
                  this.addCateForm.cat_pid=0;
                this.addCateForm.cat_level=0;
            }
        },
        // 点击按钮添加新分类
        addCate(){
            this.$refs.addCateFormRef.validate(async valid=>{
             if(!valid) return ;
            const {data:res}=await this.$http.post('/categories',this.addCateForm);
            if(res.meta.status!==201) return this.$message.error('添加新分类失败');
            this.$message.success('添加新分类成功');
            this.getCateList();
            this.addCateDialogVisible=false;
            });
          
        },
        // 监听添加分类关闭
        addCateDialogClosed(){
           this.$refs.addCateFormRef.resetFields();
           this.selectedKeys=[];
        //    因为选择的时候 就会触发改变addForm中的pid和level
           this.addCateForm.cat_level=0;
           this.addCateForm.cat_pid=0;
        },
        // 编辑分类
        showEditCateDialog(cate){
            this.editCateForm.cat_name=cate.cat_name;
           this.editCateForm.id=cate.cat_id;
            this.editDialogVisible=true;
        },
        // 提交编辑分类
        EditCate(){
             this.$refs.editCateRef.validate(async valid=>{
                if(!valid) return 
                const {data:res}=await this.$http.put('/categories/'+this.editCateForm.id,{
                    cat_name:this.editCateForm.cat_name
                });
                if(res.meta.status!==200) return this.$message.error('编辑分类失败！');
                this.$message.success('编辑分类成功！');
                this.getCateList();
                this.editDialogVisible=false;
            })
        },
        // 删除分类
        async removeCateConfirm(role){
            const confirm=await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=>err);
            if(confirm!=='confirm') return this.$message.info('已取消删除操作');
            // 请求删除该分类
            const {data:res}=await this.$http.delete('/categories/'+role.cat_id);
            if(res.meta.status!==200) return this.$message.error('删除分类失败');
            this.$message.success('删除分类成功！');
            this.getCateList();
        }
    }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top:15px;
}
.cascader {
    width: 100%;
}
</style>