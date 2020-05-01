<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                         <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                     <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- table -->
            <el-table stripe border :data="goosList">
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="140px">
                     <!-- 把时间数进行过滤成时间格式 -->
                    <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                   
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>

                    </template>

                </el-table-column>

            </el-table>
            <!-- 分页 -->
          <el-pagination  @size-change="handleSizeChange"  @current-change="handleCurrentChange"  :current-page="queryInfo.pagenum"
              :page-sizes="[3, 5, 10, 15]"  :page-size="queryInfo.pagesize"  layout="total, sizes, prev, pager, next, jumper" background :total="total">
    </el-pagination>
    
        </el-card>
    </div>
</template>

<script>
export default {
    data(){
        return {
           queryInfo :{
               query:'',
            //    第几页
               pagenum:1,
            //    每页几条数据
               pagesize:10
           },
        //    商品列表
           goosList:[],
        //    总数
        total:0
        }
    },
    created(){
        this.getGoodsList();
    },
    methods:{
        // 根据分页获取相应列表
        async getGoodsList() {
            const {data:res}=await this.$http.get('/goods',{
                params:this.queryInfo
            });
            if(res.meta.status!==200) return this.$message.error('获取商品列表失败');
            this.$message.success('获取列表成功');
            this.goosList=res.data.goods;
            this.total=res.data.total;
        },
        // 每页条数
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize;
            this.getGoodsList();
        },
        // 页码
        handleCurrentChange(currPage){
            this.queryInfo.pagenum=currPage;
            this.getGoodsList();
        },
        async removeById(id){
          const confirm=await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err);
        if(confirm!=='confirm') return this.$message.info('已取消删除');
        const {data:res}=await this.$http.delete(`/goods/${id}`);
        if(res.meta.status!==200) return this.$message.error('删除失败！');
        this.$message.success('删除成功！');
        this.getGoodsList();
        },
        // 跳转到添加商品页面
        goAddpage(){
            // 路由跳转到指定页面
            this.$router.push('/goods/add');
        }
    }
}
</script>

<style lang="less" scoped>

</style>