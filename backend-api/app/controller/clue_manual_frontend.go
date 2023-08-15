package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"openscrm/app/requests"
	"openscrm/app/services"
	"openscrm/common/app"
	"openscrm/common/log"
)

type ClueManualPublic struct {
	Base
	srv *services.ClueManual
}

// Create
// @tags 员工前台
// @Summary 新建跟进
// @Produce json
// @Accept json
// @Param params body requests.CreateClueManualReq true "新建跟进请求"
// @Success 200 {object} app.JSONResult{} "成功"
// @Failure 400 {object} app.JSONResult{} "非法请求"
// @Failure 500 {object} app.JSONResult{} "内部错误"
// @Router /api/v1/staff-frontend/customer/clue-manual [post]
func (o ClueManualPublic) Create(c *gin.Context) {
	req := requests.CreateClueManualReq{}
	handler := app.NewHandler(c)
	ok, err := handler.BindAndValidateReq(&req)
	if !ok {
		handler.ResponseBadRequestError(errors.WithStack(err))
		return
	}

	staff, err := o.GetStaffInfo(handler)
	if err != nil {
		log.TracedError("GetStaffAdminInfo failed", err)
		return
	}

	item, err := o.srv.Create(req, staff.ExtCorpID, staff.ExtID)
	if err != nil {
		err = errors.Wrap(err, "Create failed")
		handler.ResponseError(err)
		return
	}
	handler.ResponseItem(item)

}

// Delete
// @tags 员工前台
// @Summary 删除跟进
// @Produce  json
// @Accept json
// @Param params body requests.CommonDeleteReq true "删除跟进请求"
// @Success 200 {object} app.JSONResult{} "成功"
// @Failure 400 {object} app.JSONResult{} "非法请求"
// @Failure 500 {object} app.JSONResult{} "内部错误"
// @Router /api/v1/staff-frontend/customer/clue-manual/action/delete  [post]
func (o ClueManualPublic) Delete(c *gin.Context) {
	handler := app.NewHandler(c)
	req := requests.CommonDeleteReq{}
	ok, err := handler.BindAndValidateReq(&req)
	if !ok {
		handler.ResponseBadRequestError(errors.WithStack(err))
		return
	}
	staff, err := o.GetStaffInfo(handler)
	if err != nil {
		log.TracedError("GetStaffAdminInfo failed", err)
		return
	}

	res, err := o.srv.Delete(req.IDs, staff.ExtCorpID)
	if err != nil {
		err = errors.Wrap(err, "Delete failed")
		handler.ResponseError(err)
		return
	}
	handler.ResponseItem(res)
}

// Update
// @tags 员工前台
// @Summary 更新跟进
// @Produce  json
// @Accept json
// @Param id path string true "事件ID"
// @Param params body requests.UpdateClueManualReq true "更新跟进请求"
// @Success 200 {object} app.JSONResult{data=models.CustomerEvent} "成功"
// @Failure 400 {object} app.JSONResult{} "非法请求"
// @Failure 500 {object} app.JSONResult{} "内部错误"
// @Router /api/v1/staff-frontend/clue-manual/{id} [put]
func (o ClueManualPublic) Update(c *gin.Context) {
	req := requests.UpdateClueManualReq{}
	handler := app.NewHandler(c)
	ok, err := handler.BindAndValidateReq(&req)
	if !ok {
		handler.ResponseBadRequestError(errors.WithStack(err))
		return
	}

	id, err := handler.GetIDParam()
	if err != nil {
		err = errors.Wrap(err, "handler.GetIDParam failed")
		handler.ResponseBadRequestError(errors.WithStack(err))
		return
	}

	staff, err := o.GetStaffInfo(handler)
	if err != nil {
		log.TracedError("GetStaffAdminInfo failed", err)
		return
	}

	item, err := o.srv.Update(id, req, staff.ExtCorpID)
	if err != nil {
		err = errors.Wrap(err, "Update failed")
		handler.ResponseError(err)
		return
	}
	handler.ResponseItem(item)
}

func NewClueManualFrontend() *ClueManualPublic {
	return &ClueManualPublic{srv: services.NewClueManual()}
}
