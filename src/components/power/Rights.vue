<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- Card卡片 -->
        <el-card>
            <el-table :data="rightsList" stripe style="width: 100%" border>
                <!-- 使用type=index定义索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="authName" label="权限名称" width="180"></el-table-column>
                
                <el-table-column  prop="path"  label="路径"  width="180"> </el-table-column>
               
                <el-table-column  prop="level" label="权限等级">
                    <!-- 使用插槽修改内部html结构 获取当前数据-->
                    <template slot-scope="scope">
                        <!-- 通过v-if和scope.row.level传来的数据 进行按需显示 -->
                        <el-tag v-if="scope.row.level=='0'">一级</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level=='1'">二级</el-tag>
                        <el-tag type="warning" v-else>三级</el-tag>
                    </template>
                    
                </el-table-column>
                
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    data(){
        return {
            // 权限列表
            rightsList:[ ]
        }
    },
    created(){
        this.getRightList()
            },
    methods:{
        // 获取权限列表
       async getRightList(){
            const {data:res}=await this.$http.get('rights/list');
            if(res.meta.status !==200) return this.$message.error('获取用户权限列表失败!');
            this.rightsList=res.data;
            // console.log(res.data);
            
            
        }
    }
}
</script>

<style lang="less" scoped>

</style>