<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
            <el-table :data="RoleList" stripe border>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1==0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5"><el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二三级权限 -->
                            <el-col :span="19">
                                <el-row :class="[i2==0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <!-- 通过for循环嵌套 -->
                                    <el-col :span="6"><el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                     <i class="el-icon-caret-right"></i></el-col>
                                    <el-col :span="18">
                                        <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning" v-for="(item3) in item2.children" :key="item3.id">
                                            {{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                                </el-col>
                        </el-row>
                       
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoles(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                    </el-table-column>
                
             </el-table> 
        </el-card>
    <!-- 添加用户 -->
      <el-dialog  title="添加角色"  :visible.sync="addRoleDialogVisible" width="50%" >
       <el-form :model="addRoleForm" ref="addFormRef">
        <el-form-item label="角色名称">
        <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
         <el-form-item label="角色描述">
        <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleDialog">确 定</el-button>
    </span>
    </el-dialog>

<!-- 编辑角色信息 -->
     <el-dialog  title="编辑角色"  :visible.sync="setRoleDialogVisible" width="50%" >
        <!-- 树形控件 -->
    <el-form :model="editRoleForm" ref="editFormRef">
       <el-form-item label="角色 ID">
        <el-input v-model="editRoleForm.roleId" disabled></el-input>
       </el-form-item>
        <el-form-item label="角色名称">
        <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
         <el-form-item label="角色描述">
        <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleDialog">确 定</el-button>
    </span>
    </el-dialog>

        <!-- 分配权限 -->
    <el-dialog  title="分配权限"  :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose">
        <!-- 树形控件 -->
    <el-tree :data="rightsList" :props="treeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"></el-tree>
    <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
    </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
             RoleList:[],
             //展示对话框
             setRightDialogVisible:false,
             rightsList:[],
            //  树形控件属性
            treeProps:{
                label:'authName',
                children:'children'
            },
            // 默认选中的节点id值
            defKeys:[],
            setRoleDialogVisible:false,
            editRoleForm:{},
            addRoleDialogVisible:false,
            addRoleForm:{
                roleName:'',
                roleDesc:''
            },
            // 当前即将分配权限的角色id
            roleId:''
        }
       
    },
    created(){
        this.getRolesList();
    },
    methods:{
        //获取所有权限
        async getRolesList(){
            const {data:res}=await this.$http.get('/roles');
            if(res.meta.status!==200) return this.$message.error('获取角色列表失败');
            this.RoleList=res.data;
            // console.log(this.RoleList);
       },
    //    添加角色
    async addRoleDialog(){
        const {data:res}=await this.$http.post('/roles',this.addRoleForm);
        if(res.meta.status!==201) return this.$message.error('添加用户失败！');
        this.RoleList.push(res.data);
        this.getRolesList();
        this.addRoleDialogVisible=false;
    },
    //    根据id编辑权限
       async editRole(id){
           const {data:res}=await this.$http.get('/roles/'+id);
           if(res.meta.status!==200) return this.$message.error('修改角色信息失败！');
           this.editRoleForm=res.data;
           this.setRoleDialogVisible=true;
       },
    //    提交编辑修改
        editRoleDialog(){
           this.$refs.editFormRef.validate(async valid=>{
               if(!valid) return false;
                 const {data:res} =await this.$http.put('/roles/'+this.editRoleForm.roleId,{
                     roleName:this.editRoleForm.roleName,
                     roleDesc:this.editRoleForm.roleDesc
                 });
           
           if(res.meta.status!==200) return this.$message.error('修改角色信息失败！');
            this.setRoleDialogVisible=false;
            this.getRolesList();
            });
       },
    //    根据id删除对应权限
   async removeRightById(Role,rightId){
        // 提示是否删除
        const confirm=await this.$confirm('此操作将永久删除该权限，是否继续','提示',{
            confirmButtonText:'确定',
            cancelButtonText:'取消',
            type:'warning'
        }).catch(err=>err);
        if(confirm!=='confirm'){
            return this.$message.info('取消删除成功');
        }
        // 确认删除 请求后台删除数据
        const {data:res}=await this.$http.delete(`/roles/${Role.id}/rights/${rightId}`);
        
        if(res.meta.status!==200) return this.$message.error('删除角色权限失败');
        // this.getRolesList() 不需要刷新整个页面 只要刷新当前角色的权限就好
        Role.children=res.data;
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role){
        this.roleId=role.id;
        // 获取权限数据
        const {data:res}=await this.$http.get('/rights/tree');
        if(res.meta.status!==200) return this.$message.error('获取用户权限列表失败');
    //    获取权限数据到data中
       this.rightsList=res.data;
    //   递归获取三级节点
    this.getLeafKeys(role,this.defKeys);
       
        this.setRightDialogVisible=true
    },
    // 通过递归形式、获取角色下所有三级权限id，并保存到defkeys
    getLeafKeys(node,arr){
        if(!node.children) {
            // 将当前node三级节点放入
            return arr.push(node.id);
        }
        node.children.forEach(item => {
            this.getLeafKeys(item,arr);
        });
    },
    // 监听对话框关闭事件 需要将defKeys置空
    setRightDialogClose(){
        this.defKeys=[];
    },
    // 为角色分配权限
    async allotRights(){
        const keys=[
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ];
        const idStr=keys.join(',');
        const {data:res}=await this.$http.post(`/roles/${this.roleId}/rights`,{rids:idStr});
        if(res.meta.status!==200) return this.$message.error('分配用户权限列表失败');
        this.$message.success('分配用户权限列表成功');
        this.setRightDialogVisible=false;
        this.getRolesList();
    },
    // 删除角色
    async removeRoles(id){
        // 询问是否确认删除
        const confirm =await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err);
        if(confirm !== 'confirm') return this.$message.info('已取消操作');
        // 向后台请求删除该角色
        const {data:res}=await this.$http.delete('/roles/'+id);
        if(res.meta.status!==200) return this.$message.error('删除角色失败');
        this.$message.success('删除角色成功');
        this.getRolesList();
    }
    } 
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
// 居中显示
.vcenter {
    display: flex;
    align-items: center;
}
</style>