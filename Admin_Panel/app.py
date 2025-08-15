from flask import Flask, request, render_template_string, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from datetime import datetime, timedelta
from sqlalchemy import extract, func, desc
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from models import db, User, Product, Category, Orders, OrderItem, Payment, Branches

app = Flask(__name__)


app.secret_key = 'your_secret_key'

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://divs:foodforthought@localhost/Grocery_Market"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

admin = Admin(app, name='Grocery Market Admin', template_mode='bootstrap4')
admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Category, db.session))
admin.add_view(ModelView(Product, db.session))
admin.add_view(ModelView(Orders, db.session))
admin.add_view(ModelView(OrderItem, db.session))
admin.add_view(ModelView(Payment, db.session))
admin.add_view(ModelView(Branches, db.session))

@app.route('/')
def home():
    return '''
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>🛒 Grocery Market Admin Panel</h1>
        <div style="margin: 30px;">
            <a href="/admin" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px; display: inline-block;">📊 Admin Panel</a>
            <a href="/admin/dashboard" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px; display: inline-block;">📈 Dashboard</a>
        </div>
    </div>
    '''

def get_filtered_data(year=None, month=None, start_date=None, end_date=None, branch_id=None):
    """Get filtered order data based on parameters"""
    query = db.session.query(Orders)
    
    if year and month:
        query = query.filter(
            extract('year', Orders.created_at) == year,
            extract('month', Orders.created_at) == month
        )
    elif start_date and end_date:
        query = query.filter(
            Orders.created_at >= start_date,
            Orders.created_at <= end_date
        )
    
    # Only filter by branch if the Orders model has branch_id attribute
    if branch_id and hasattr(Orders, 'branch_id'):
        query = query.filter(Orders.branch_id == branch_id)
    
    return query.all()

def make_compact_chart(fig, title, width=400, height=250):
    """Helper function to style Plotly figures compactly"""
    fig.update_layout(
        title=title,
        width=width,
        height=height,
        margin=dict(l=15, r=15, t=35, b=15),
        font=dict(size=10),
        title_font=dict(size=14),
        showlegend=False,
        plot_bgcolor='white',
        paper_bgcolor='white'
    )
    
    # For pie charts, keep legend but make it smaller
    if any('pie' in str(type(trace)) for trace in fig.data):
        fig.update_layout(
            showlegend=True,
            legend=dict(
                orientation="v",
                yanchor="middle",
                y=0.5,
                xanchor="left",
                x=1.02,
                font=dict(size=9)
            )
        )
    
    return fig.to_html(full_html=False, include_plotlyjs=False)

@app.route('/admin/dashboard')
def admin_dashboard():
    # Get filter parameters
    selected_year = request.args.get('year', datetime.now().year, type=int)
    selected_month = request.args.get('month', datetime.now().month, type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    branch_id = request.args.get('branch_id', type=int)
    section = request.args.get('section', 'overview')
    
    # Convert date strings to datetime objects
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
    
    # Get filtered orders
    if start_date and end_date:
        orders = get_filtered_data(start_date=start_date, end_date=end_date, branch_id=branch_id)
    else:
        orders = get_filtered_data(year=selected_year, month=selected_month, branch_id=branch_id)
    
    # Get branches for filter dropdown (only if branch filtering is relevant)
    try:
        branches = db.session.query(Branches).all() if hasattr(Orders, 'branch_id') else []
    except:
        branches = []
    
    # Prepare orders data
    orders_data = []
    for order in orders:
        for item in order.items:
            orders_data.append({
                'order_id': order.id,
                'user_id': order.user_id,
                'date': order.created_at.date(),
                'datetime': order.created_at,
                'product_id': item.product_id,
                'product_name': item.product.name,
                'category': item.product.category_obj.name if item.product.category_obj else 'Unknown',
                'quantity': item.quantity,
                'unit_price': item.unit_price/item.quantity,
                'total_price': item.unit_price,
                'status': order.status,
                'branch_id': getattr(order, 'branch_id', None)  # Safe attribute access
            })
    
    df = pd.DataFrame(orders_data)
    
    if df.empty:
        return render_template_string("""
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h3>📊 No data available for the selected filters.</h3>
            <a href="/admin/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Filters</a>
        </div>
        """)
    
    # Generate content based on section
    content_html = ""
    
    if section == 'overview':
        content_html = generate_overview_content(df, orders)
    elif section == 'sales':
        content_html = generate_sales_content(df, orders)
    elif section == 'accounts':
        content_html = generate_accounts_content(df, orders)
    
    return render_template_string(DASHBOARD_TEMPLATE, 
                                content_html=content_html, 
                                section=section,
                                branches=branches,
                                selected_year=selected_year,
                                selected_month=selected_month,
                                start_date=start_date.strftime('%Y-%m-%d') if start_date else '',
                                end_date=end_date.strftime('%Y-%m-%d') if end_date else '',
                                branch_id=branch_id or '')

def generate_overview_content(df, orders):
    """Generate overview dashboard content"""
    
    # Calculate key metrics
    total_revenue = df['total_price'].sum()
    total_orders = df['order_id'].nunique()
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    total_items_sold = df['quantity'].sum()
    
    # Chart 1: Daily Revenue
    daily_revenue = df.groupby('date')['total_price'].sum().reset_index()
    fig1 = px.bar(daily_revenue, x='date', y='total_price',
                 labels={'total_price': 'Revenue (₹)', 'date': 'Date'})
    html1 = make_compact_chart(fig1, '📊 Daily Revenue')
    
    # Chart 2: Top Products
    top_products = df.groupby('product_name')['quantity'].sum().reset_index().sort_values('quantity', ascending=False).head(8)
    fig2 = px.bar(top_products, x='product_name', y='quantity',
                 labels={'product_name': 'Product', 'quantity': 'Units Sold'})
    fig2.update_xaxes(tickangle=45)
    html2 = make_compact_chart(fig2, '📦 Top-Selling Products')
    
    # Chart 3: Revenue by Category
    category_revenue = df.groupby('category')['total_price'].sum().reset_index()
    fig3 = px.pie(category_revenue, values='total_price', names='category')
    html3 = make_compact_chart(fig3, '🧾 Revenue by Category')
    
    # Chart 4: Orders per Day
    daily_orders = df.groupby('date')['order_id'].nunique().reset_index()
    fig4 = px.bar(daily_orders, x='date', y='order_id',
                 labels={'order_id': 'No. of Orders', 'date': 'Date'})
    html4 = make_compact_chart(fig4, '📅 Orders per Day')
    
    # KPI Cards
    kpi_html = f'''
    <div class="kpi-row">
        <div class="kpi-card">
            <h3>💰 Total Revenue</h3>
            <p class="kpi-value">₹{total_revenue:,.2f}</p>
        </div>
        <div class="kpi-card">
            <h3>📦 Total Orders</h3>
            <p class="kpi-value">{total_orders:,}</p>
        </div>
        <div class="kpi-card">
            <h3>📊 Avg Order Value</h3>
            <p class="kpi-value">₹{avg_order_value:,.2f}</p>
        </div>
        <div class="kpi-card">
            <h3>🛒 Items Sold</h3>
            <p class="kpi-value">{total_items_sold:,}</p>
        </div>
    </div>
    '''
    
    # Charts Grid
    charts_html = f'''
    <div class="chart-row">
        <div class="chart">{html1}</div>
        <div class="chart">{html2}</div>
    </div>
    <div class="chart-row">
        <div class="chart">{html3}</div>
        <div class="chart">{html4}</div>
    </div>
    '''
    
    return kpi_html + charts_html

def generate_sales_content(df, orders):
    """Generate sales-specific dashboard content"""
    
    # Sales KPIs
    total_revenue = df['total_price'].sum()
    total_orders = df['order_id'].nunique()
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Order status breakdown
    status_counts = df.groupby('status')['order_id'].nunique().reset_index()
    
    # Peak sales analysis
    hourly_sales = df.groupby(df['datetime'].dt.hour)['total_price'].sum().reset_index()
    peak_hour = hourly_sales.loc[hourly_sales['total_price'].idxmax(), 'datetime'] if not hourly_sales.empty else 'N/A'
    
    # Chart 1: Sales Trend (Weekly)
    df['week'] = df['datetime'].dt.isocalendar().week
    weekly_sales = df.groupby('week')['total_price'].sum().reset_index()
    fig1 = px.line(weekly_sales, x='week', y='total_price',
                  labels={'total_price': 'Revenue (₹)', 'week': 'Week'})
    html1 = make_compact_chart(fig1, '📈 Weekly Sales Trend')
    
    # Chart 2: Top Products by Revenue
    top_revenue_products = df.groupby('product_name')['total_price'].sum().reset_index().sort_values('total_price', ascending=False).head(10)
    fig2 = px.bar(top_revenue_products, x='product_name', y='total_price',
                 labels={'product_name': 'Product', 'total_price': 'Revenue (₹)'})
    fig2.update_xaxes(tickangle=45)
    html2 = make_compact_chart(fig2, '💰 Top Products by Revenue', width=500)
    
    # Chart 3: Category Performance
    category_stats = df.groupby('category').agg({
        'total_price': 'sum',
        'quantity': 'sum'
    }).reset_index()
    fig3 = px.scatter(category_stats, x='quantity', y='total_price', 
                     hover_data=['category'], size='total_price',
                     labels={'quantity': 'Units Sold', 'total_price': 'Revenue (₹)'})
    html3 = make_compact_chart(fig3, '🎯 Category Performance')
    
    # Chart 4: Order Status Breakdown
    fig4 = px.pie(status_counts, values='order_id', names='status')
    html4 = make_compact_chart(fig4, '📦 Order Status Distribution')
    
    # Chart 5: Peak Sales Hours
    fig5 = px.bar(hourly_sales, x='datetime', y='total_price',
                 labels={'datetime': 'Hour of Day', 'total_price': 'Revenue (₹)'})
    html5 = make_compact_chart(fig5, '🕐 Sales by Hour')
    
    # Location-based sales (if branch data available)
    if 'branch_id' in df.columns and df['branch_id'].notna().any():
        branch_sales = df.groupby('branch_id')['total_price'].sum().reset_index()
        # Get branch names if Branches model is available
        try:
            branch_names = {branch.id: branch.name for branch in db.session.query(Branches).all()}
            branch_sales['branch_name'] = branch_sales['branch_id'].map(branch_names)
            fig6 = px.bar(branch_sales, x='branch_name', y='total_price',
                         labels={'branch_name': 'Branch', 'total_price': 'Revenue (₹)'})
        except:
            fig6 = px.bar(branch_sales, x='branch_id', y='total_price',
                         labels={'branch_id': 'Branch ID', 'total_price': 'Revenue (₹)'})
        html6 = make_compact_chart(fig6, '📍 Sales by Branch')
    else:
        html6 = '<div class="chart"><p style="text-align: center; padding: 50px; color: #7f8c8d;">📍 Branch data not available in current Orders model</p></div>'
    
    # KPI Cards
    kpi_html = f'''
    <div class="kpi-row">
        <div class="kpi-card">
            <h3>💰 Total Revenue</h3>
            <p class="kpi-value">₹{total_revenue:,.2f}</p>
        </div>
        <div class="kpi-card">
            <h3>📦 Total Orders</h3>
            <p class="kpi-value">{total_orders:,}</p>
        </div>
        <div class="kpi-card">
            <h3>📊 Avg Order Value</h3>
            <p class="kpi-value">₹{avg_order_value:,.2f}</p>
        </div>
        <div class="kpi-card">
            <h3>🕐 Peak Hour</h3>
            <p class="kpi-value">{peak_hour}:00</p>
        </div>
    </div>
    '''
    
    # Charts Grid
    charts_html = f'''
    <div class="chart-row">
        <div class="chart">{html1}</div>
        <div class="chart">{html2}</div>
    </div>
    <div class="chart-row">
        <div class="chart">{html3}</div>
        <div class="chart">{html4}</div>
    </div>
    <div class="chart-row">
        <div class="chart">{html5}</div>
        <div class="chart">{html6}</div>
    </div>
    '''
    
    return kpi_html + charts_html

def generate_accounts_content(df, orders):
    """Generate accounts/users dashboard content"""
    
    # User metrics
    total_users_with_orders = df['user_id'].nunique()
    
    # Get all users for growth analysis
    all_users = db.session.query(User).all()
    total_registered_users = len(all_users)
    
    # User spending analysis
    user_spending = df.groupby('user_id')['total_price'].sum().reset_index()
    avg_spending_per_user = user_spending['total_price'].mean()
    top_spenders = user_spending.sort_values('total_price', ascending=False).head(10)
    
    # User order frequency
    user_orders = df.groupby('user_id')['order_id'].nunique().reset_index()
    avg_orders_per_user = user_orders['order_id'].mean()
    
    # New vs returning customers analysis
    first_order_dates = df.groupby('user_id')['datetime'].min().reset_index()
    current_period_start = df['datetime'].min()
    new_customers = first_order_dates[first_order_dates['datetime'] >= current_period_start]['user_id'].nunique()
    returning_customers = total_users_with_orders - new_customers
    
    # Chart 1: Top Customers by Spending
    fig1 = px.bar(top_spenders, x='user_id', y='total_price',
                 labels={'user_id': 'User ID', 'total_price': 'Total Spent (₹)'})
    html1 = make_compact_chart(fig1, '🏆 Top Customers by Spending')
    
    # Chart 2: User Spending Distribution
    fig2 = px.histogram(user_spending, x='total_price', nbins=20,
                       labels={'total_price': 'Total Spent (₹)', 'count': 'Number of Users'})
    html2 = make_compact_chart(fig2, '💳 Customer Spending Distribution')
    
    # Chart 3: Orders per Customer
    fig3 = px.histogram(user_orders, x='order_id', nbins=15,
                       labels={'order_id': 'Number of Orders', 'count': 'Number of Users'})
    html3 = make_compact_chart(fig3, '📦 Orders per Customer')
    
    # Chart 4: New vs Returning Customers
    customer_type_data = pd.DataFrame({
        'type': ['New Customers', 'Returning Customers'],
        'count': [new_customers, returning_customers]
    })
    fig4 = px.pie(customer_type_data, values='count', names='type')
    html4 = make_compact_chart(fig4, '👥 Customer Type Distribution')
    
    # Chart 5: User Registration Growth (if created_at available in User model)
    try:
        user_registration_data = []
        for user in all_users:
            if hasattr(user, 'created_at') and user.created_at:
                user_registration_data.append({
                    'date': user.created_at.date(),
                    'user_id': user.id
                })
        
        if user_registration_data:
            reg_df = pd.DataFrame(user_registration_data)
            daily_registrations = reg_df.groupby('date').count().reset_index()
            daily_registrations['cumulative'] = daily_registrations['user_id'].cumsum()
            
            fig5 = px.line(daily_registrations, x='date', y='cumulative',
                          labels={'date': 'Date', 'cumulative': 'Total Registered Users'})
            html5 = make_compact_chart(fig5, '📈 User Growth Over Time')
        else:
            html5 = '<div class="chart"><p style="text-align: center; padding: 50px;">User registration data not available</p></div>'
    except:
        html5 = '<div class="chart"><p style="text-align: center; padding: 50px;">User registration data not available</p></div>'
    
    # Chart 6: Active Users (users who placed orders)
    monthly_active_users = df.groupby(df['datetime'].dt.to_period('M'))['user_id'].nunique().reset_index()
    monthly_active_users['datetime'] = monthly_active_users['datetime'].astype(str)
    
    fig6 = px.bar(monthly_active_users, x='datetime', y='user_id',
                 labels={'datetime': 'Month', 'user_id': 'Active Users'})
    html6 = make_compact_chart(fig6, '👤 Monthly Active Users')
    
    # KPI Cards
    kpi_html = f'''
    <div class="kpi-row">
        <div class="kpi-card">
            <h3>👥 Total Registered</h3>
            <p class="kpi-value">{total_registered_users:,}</p>
        </div>
        <div class="kpi-card">
            <h3>🛒 Active Users</h3>
            <p class="kpi-value">{total_users_with_orders:,}</p>
        </div>
        <div class="kpi-card">
            <h3>💰 Avg Spending</h3>
            <p class="kpi-value">₹{avg_spending_per_user:,.2f}</p>
        </div>
        <div class="kpi-card">
            <h3>📦 Avg Orders</h3>
            <p class="kpi-value">{avg_orders_per_user:.1f}</p>
        </div>
    </div>
    '''
    
    # Charts Grid
    charts_html = f'''
    <div class="chart-row">
        <div class="chart">{html1}</div>
        <div class="chart">{html2}</div>
    </div>
    <div class="chart-row">
        <div class="chart">{html3}</div>
        <div class="chart">{html4}</div>
    </div>
    <div class="chart-row">
        <div class="chart">{html5}</div>
        <div class="chart">{html6}</div>
    </div>
    '''
    
    return kpi_html + charts_html

# Dashboard HTML Template
DASHBOARD_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Grocery Market - Admin Dashboard</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .nav-tabs {
            display: flex;
            background: #34495e;
            border-bottom: 3px solid #2c3e50;
        }
        
        .nav-tab {
            flex: 1;
            padding: 15px 20px;
            background: #34495e;
            color: white;
            text-decoration: none;
            text-align: center;
            font-weight: bold;
            transition: all 0.3s ease;
            border-right: 1px solid #2c3e50;
        }
        
        .nav-tab:hover {
            background: #2c3e50;
            transform: translateY(-2px);
        }
        
        .nav-tab.active {
            background: #3498db;
            box-shadow: inset 0 3px 0 #2980b9;
        }
        
        .filters {
            background: #ecf0f1;
            padding: 20px;
            border-bottom: 2px solid #bdc3c7;
        }
        
        .filter-row {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            align-items: center;
            justify-content: center;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .filter-group label {
            font-weight: bold;
            color: #2c3e50;
            font-size: 0.9em;
        }
        
        .filter-group select,
        .filter-group input {
            padding: 8px 12px;
            border: 2px solid #bdc3c7;
            border-radius: 6px;
            font-size: 14px;
            min-width: 120px;
        }
        
        .filter-group select:focus,
        .filter-group input:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
        }
        
        .filter-btn {
            padding: 10px 20px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            margin-top: 20px;
        }
        
        .filter-btn:hover {
            background: #2980b9;
            transform: translateY(-1px);
        }
        
        .content {
            padding: 30px;
        }
        
        .kpi-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .kpi-card {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(116, 185, 255, 0.3);
            transform: translateY(0);
            transition: all 0.3s ease;
        }
        
        .kpi-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(116, 185, 255, 0.4);
        }
        
        .kpi-card h3 {
            font-size: 1.1em;
            margin-bottom: 10px;
            opacity: 0.9;
        }
        
        .kpi-value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 0;
        }
        
        .chart-row {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .chart {
            background: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            flex: 0 0 auto;
            transition: all 0.3s ease;
        }
        
        .chart:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 1200px) {
            .chart-row {
                flex-direction: column;
                align-items: center;
            }
        }
        
        @media (max-width: 768px) {
            body { padding: 10px; }
            .header { padding: 20px; }
            .header h1 { font-size: 2em; }
            .nav-tabs { flex-direction: column; }
            .filter-row { flex-direction: column; }
            .kpi-row { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 Grocery Market Dashboard</h1>
            <p>Comprehensive Analytics & Insights</p>
        </div>
        
        <div class="nav-tabs">
            <a href="?section=overview" class="nav-tab {{ 'active' if section == 'overview' else '' }}">📊 Overview</a>
            <a href="?section=sales" class="nav-tab {{ 'active' if section == 'sales' else '' }}">💰 Sales</a>
            <a href="?section=accounts" class="nav-tab {{ 'active' if section == 'accounts' else '' }}">👥 Accounts</a>
        </div>
        
        <div class="filters">
            <form method="GET">
                <input type="hidden" name="section" value="{{ section }}">
                <div class="filter-row">
                    <div class="filter-group">
                        <label>📅 Year</label>
                        <select name="year">
                            <option value="{{ selected_year }}" selected>{{ selected_year }}</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>📅 Month</label>
                        <select name="month">
                            {% for i in range(1, 13) %}
                            <option value="{{ i }}" {{ 'selected' if i == selected_month else '' }}>{{ i }}</option>
                            {% endfor %}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>📅 Start Date</label>
                        <input type="date" name="start_date" value="{{ start_date }}">
                    </div>
                    
                    <div class="filter-group">
                        <label>📅 End Date</label>
                        <input type="date" name="end_date" value="{{ end_date }}">
                    </div>
                    
                    <div class="filter-group">
                        <label>📍 Branch</label>
                        <select name="branch_id">
                            <option value="">All Branches</option>
                            {% for branch in branches %}
                            <option value="{{ branch.id }}" {{ 'selected' if branch.id == branch_id else '' }}>{{ branch.name if branch.name else 'Branch ' + branch.id|string }}</option>
                            {% endfor %}
                        </select>
                    </div>
                    {% if not branches %}
                    <div class="filter-group">
                        <small style="color: #7f8c8d;">📍 Branch filtering unavailable</small>
                    </div>
                    {% endif %}
                </div>
                
                <div style="text-align: center;">
                    <button type="submit" class="filter-btn">🔍 Apply Filters</button>
                    <a href="/admin/dashboard?section={{ section }}" class="filter-btn" style="background: #e74c3c; margin-left: 10px; text-decoration: none; display: inline-block;">🔄 Reset</a>
                </div>
            </form>
        </div>
        
        <div class="content">
            {{ content_html | safe }}
        </div>
    </div>
</body>
</html>
'''

# Legacy route for backward compatibility
@app.route('/admin/stats')
def admin_stats():
    """Legacy stats route - redirects to new dashboard"""
    selected_year = request.args.get('year', datetime.now().year, type=int)
    selected_month = request.args.get('month', datetime.now().month, type=int)
    return redirect(f'/admin/dashboard?section=overview&year={selected_year}&month={selected_month}')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)