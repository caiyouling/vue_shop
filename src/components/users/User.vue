<template>
    <div>
     <!-- 面包屑导航 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 用户列表 -->
    <el-card >
         <!-- 搜索添加 gutter指定列之间间隔 -->
       <el-row :gutter="20">
           <el-col :span="8">
               <!-- 添加clearable可以点击×清空 clear事件表示清空时触发重新获取用户列表即可显示全部 -->
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                 </el-input>
           </el-col>
           <el-col :span="4">
               <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
           </el-col>
        </el-row>
        <!-- 渲染表格 :data绑定data中要渲染的数组-->
     <el-table :data="userList" style="width: 100%" stripe border>
         <!-- label为标题 width宽度 props表示要渲染的数据项-->
         <!-- 添加索引列 type设置为index -->
         <el-table-column type="index"></el-table-column>
      <el-table-column
        prop="username"
        label="姓名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        width="180">
      </el-table-column>
      <el-table-column  prop="mobile" label="电话">
      </el-table-column>
       <el-table-column prop="role_name" label="角色">
      </el-table-column>
      <!-- 作用域插槽会覆盖props 使用template和插槽改造数据结构 -->
       <el-table-column prop="mg_state" label="状态">
           <!-- 作用域插槽 通过scope.row可以获取当前行的数据 -->
           <template slot-scope="scope">
               <!-- {{scope.row}} --->
               <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
           </template>
      </el-table-column>
       <el-table-column label="操作" width="180">
           <!-- 使用插槽控制操作里面的内容 -->
           <template slot-scope="scope">
               <!-- 修改 -->
               <el-button type="primary" icon="el-icon-edit" :index="scope.index" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
               <!-- 删除 -->
               <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
               <!-- 分配角色 -->
                <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                    <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                </el-tooltip>
           </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
                    :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
        <!-- 内容主体 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
             <el-input v-model="addForm.password"></el-input>
            </el-form-item>
             <el-form-item label="邮箱" prop="email">
             <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="mobile">
             <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <!-- 对话框底部按钮 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户"  :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <el-form-item label="用户名" >
            <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
             <el-form-item label="邮箱" prop="email">
             <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="mobile">
             <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
    </span>
    </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        // 验证邮箱
        var checkEmail=(rules,value,cb)=>{
            const regEmail=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if(regEmail.test(value)){
                return cb()
            }
            cb(new Error('请输入合法的邮箱'))
       }
    //    验证手机
        var checkMobile=(rules,value,cb)=>{
              const regMobile=/^(0|86|17951)?(13[0-9]|14[57])[0-9]{8}$/
            if(regMobile.test(value)){
                return cb()
            }
            cb(new Error('请输入合法的手机号'))
        }
        return {
              //获取用户列表的参数 向后台发送请求的参数
              queryInfo:{
                query:'',
                // 当前显示第几页,默认情况下是第一页，显示2条数据
                pagenum:1,
                // 当前每页显示多少数据
                pagesize:2
            },
            userList:[],
            total:0,
            // 控制添加用户 对话框的显示和隐藏
           addDialogVisible:false,
        //    添加用户的表单数据
           addForm:{
               username:'',
               password:'',
               email:'',
               mobile:''
           },
        //    表单验证规则对象
           addFormRules:{
               username:[
                   {required:true,message:'请输入用户名',trigger:'blur'},
                   {min:3,max:10,message:'用户名长度为3-10之间',trigger:'blur'}
               ],
               password:[
                    {required:true,message:'请输入密码',trigger:'blur'},
                   {min:3,max:10,message:'密码长度为3-10之间',trigger:'blur'}
               ],
               email:[
                    {required:true,message:'请输入邮箱',trigger:'blur'},
                // 使用自定义校验规则
                {validator:checkEmail,  trigger:'blur'}
               ],
               mobile:[
                    {required:true,message:'请输入邮箱',trigger:'blur'},
                {validator:checkMobile,  trigger:'blur'}
                    
               ]
           },
            // 修改用户对话框
            editDialogVisible:false,
            // 查询到的用户信息对象
            editForm:{},
            editFormRules:{
                email:[
                      {required:true,message:'请输入邮箱',trigger:'blur'},
                // 使用自定义校验规则
                     {validator:checkEmail,  trigger:'blur'}
                ],
                 mobile:[
                    {required:true,message:'请输入邮箱',trigger:'blur'},
                {validator:checkMobile,  trigger:'blur'}
                    
               ]
            }
        }   
    },
    created(){
        this.getUserList();
    },
    methods:{
        async getUserList(){
            const {data:res}=await this.$http.get('/users',{params:this.queryInfo});
            // console.log(res);
            if(res.meta.status!==200) return this.$message.error('获取用户列表失败');
            this.userList=res.data.users;
            this.total=res.data.total;
        } ,
        // 监听pageSize 当每页显示的数据变化时，获取的users就会变化
            handleSizeChange(newSize){
                // console.log(pageSize)
                this.queryInfo.pagesize=newSize;
                this.getUserList()
         },
        //  监听页码值改变
         handleCurrentChange(newPage){
            //  console.log(newPage)
             this.queryInfo.pagenum=newPage;
             this.getUserList();
         },
        //  监听switch状态改变 将状态保存到后台
        async userStateChange(userInfo) {
            const {data:res}=await this.$http.put(`/users/${userInfo.id}/state/${userInfo.mg_state}`);
            if(res.meta.status!==200){
                // 修改失败，就要取反表示还是原来的状态没有改变
                userInfo.mg_state=!userInfo.mg_state;
                return this.$message.error('修改用户状态失败')
            } 
            this.$message.success('更新用户状态成功');
        },
        // 监听对话框关闭 将内容清空
        addDialogClose(){
            console.log(this);
            console.log(this.$refs);
            
            this.$refs.addFormRef.resetFields()
        },
        // 点击添加用户
        addUser(){
            // 对表单全部验证，验证成功后才能添加
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return
                // 添加请求
              const {data:res} = await this.$http.post('/users',this.addForm);
            if(res.meta.status!==201)  return this.$message.error('添加用户失败');
                this.$message.success('添加用户成功!');
                this.addDialogVisible=false;
                this.getUserList()
           })
        },
        // 展示编辑用户对话框 通过插槽进行传参
       async showEditDialog(id){
        //    console.log(id);
           
           const {data:res}=await this.$http.get('/users/'+id);
           console.log(res);
           
           if(res.meta.status !==200) return this.$message.error('查询用户信息失败');
            this.editDialogVisible=true;
            this.editForm=res.data;
       },
    //    编辑对话框的关闭
       editDialogClose(){
           this.$refs.editFormRef.resetFields();//重置表单
       },
    //    预验证
       editUserInfo(){
           this.$refs.editFormRef.validate(async (valid)=>{
               if(!valid) return ;
               const {data:res}=await this.$http.put('/users/'+this.editForm.id,
               {email:this.editForm.email,
                mobile:this.editForm.mobile
               });
               if(res.meta.status!==200) return this.$message.error('修改用户信息失败');
            //   关闭对话框 更新用户列表 提示成功
              this.editDialogVisible=false;
               this.getUserList();
               this.$message.success('更新成功！');
           })
       },
    //    根据id删除用户
    async removeUserById(id){
        // 询问用户是否删除
        const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        // 确认删除返回confirm 取消返回cancel
        if(confirmResult!=='confirm') return this.$message.info('已取消删除')
        const {data:res}=await this.$http.delete('/users/'+id);
        if(res.meta.status!==200) return this.$message.error('删除用户失败');
        this.$message.success('删除用户成功');
        this.getUserList();
      }
    }
}
</script>

<style lang="less" scoped>

</style>