module.exports = (sequelize, DataTypes) => {
  const ServiceHistory = sequelize.define(
    'ServiceHistory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id',
        },
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id',
        },
      },
      service_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: 'Giá dịch vụ không được nhỏ hơn 0',
          },
        },
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Tiền mặt',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'service_histories',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  // Định nghĩa các mối quan hệ
  ServiceHistory.associate = function associateModels(db) {
    ServiceHistory.belongsTo(db.Customer, {
      foreignKey: 'customer_id',
      as: 'customer',
    });
    ServiceHistory.belongsTo(db.Service, {
      foreignKey: 'service_id',
      as: 'service',
    });
    ServiceHistory.belongsTo(db.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });
  };

  return ServiceHistory;
};
