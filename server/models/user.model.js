module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');
  const bcrypt = require('bcryptjs');

  class User extends Model {
    // Phương thức kiểm tra mật khẩu
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    // Phương thức lấy thông tin công khai của người dùng
    toJSON() {
      const values = Object.assign({}, this.get());
      // Ẩn các trường nhạy cảm
      delete values.password;
      delete values.refresh_token;
      delete values.email_verification_token;
      delete values.reset_password_token;
      delete values.reset_password_expires;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'Tên đăng nhập không được để trống',
          },
          len: {
            args: [3, 30],
            msg: 'Tên đăng nhập phải từ 3 đến 30 ký tự',
          },
          is: {
            args: /^[a-zA-Z0-9_]+$/,
            msg: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới',
          },
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Email không hợp lệ',
          },
          notEmpty: {
            msg: 'Email không được để trống',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Mật khẩu không được để trống',
          },
          len: {
            args: [6],
            msg: 'Mật khẩu phải có ít nhất 6 ký tự',
          },
        },
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Họ và tên không được để trống',
          },
          len: {
            args: [2, 100],
            msg: 'Họ và tên phải từ 2 đến 100 ký tự',
          },
        },
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
          is: {
            args: /^[0-9]{10,15}$/,
            msg: 'Số điện thoại không hợp lệ',
          },
        },
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('admin', 'staff', 'user'),
        defaultValue: 'user',
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      email_verification_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      refresh_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      defaultScope: {
        attributes: {
          exclude: [
            'password',
            'refresh_token',
            'email_verification_token',
            'reset_password_token',
            'reset_password_expires',
          ],
        },
      },
      scopes: {
        withSecrets: {
          attributes: { include: [] },
        },
      },
      hooks: {
        // Mã hóa mật khẩu trước khi lưu
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};
